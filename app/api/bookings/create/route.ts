import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { pool } from '@/lib/db';
import { verifyToken, validateFields } from '@/lib/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    // Grab a dedicated client from the pool for a guaranteed safe Postgres Transaction
    const client = await pool.connect();

    try {
        // 1. Verify Authentication Header
        const { decoded, errorResponse } = verifyToken(req);
        if (errorResponse) {
            client.release();
            return errorResponse;
        }

        const userId = decoded!.userId;

        // 2. Parse Request Body
        const body = await req.json();
        const { event_id, seats_requested = 1, payment_utr } = body;

        const validationError = validateFields(body, ['event_id', 'payment_utr']);
        if (validationError) {
            client.release();
            return validationError;
        }

        if (seats_requested < 1) {
            client.release();
            return NextResponse.json({ error: 'Must book at least 1 seat.' }, { status: 400 });
        }

        // 3. Validate Payment UTR Format using Regex (Standard 12 digit UPI reference format, or alphanumeric basic)
        const utrRegex = /^[a-zA-Z0-9]{8,20}$/;
        if (!utrRegex.test(payment_utr)) {
            client.release();
            return NextResponse.json(
                { error: 'Invalid Payment UTR format. UTRs are typically 12-digit alphanumeric codes.' },
                { status: 400 }
            );
        }

        // === START DATABASE TRANSACTION ===
        await client.query('BEGIN');

        // 4. Fetch event and aggressively lock the row for update to prevent concurrent race conditions
        const eventRes = await client.query(
            `SELECT id, is_active, seats_available 
       FROM events 
       WHERE id = $1 FOR UPDATE`,
            [event_id]
        );

        if (eventRes.rowCount === 0) {
            await client.query('ROLLBACK');
            client.release();
            return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
        }

        const event = eventRes.rows[0];

        if (!event.is_active) {
            await client.query('ROLLBACK');
            client.release();
            return NextResponse.json({ error: 'This event is no longer active.' }, { status: 400 });
        }

        // 5. Seat Logic validation mapping
        if (event.seats_available !== null) {
            if (event.seats_available < seats_requested) {
                await client.query('ROLLBACK');
                client.release();
                return NextResponse.json(
                    { error: `Insufficient seats available. Only ${event.seats_available} seats remaining.` },
                    { status: 409 } // Conflict
                );
            }

            // Deduct seats
            const newSeatCount = event.seats_available - seats_requested;
            await client.query(
                `UPDATE events SET seats_available = $1 WHERE id = $2`,
                [newSeatCount, event_id]
            );
        } // If null, the seating is unbounded/unlimited

        // 6. Generate Bookings ID preemptively for the Token payload
        // Using a simple query since we are doing manual gen_random_uuid in postgres to avoid two trips
        const bookingRes = await client.query(
            `INSERT INTO bookings (event_id, user_id, seats_booked, payment_utr, payment_verified)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, created_at`,
            [event_id, userId, seats_requested, payment_utr]
        );

        const booking = bookingRes.rows[0];

        // 7. Generate Signed QR Cryptographic Token
        const qrPayload = {
            booking_id: booking.id,
            user_id: userId,
            event_id: event_id
        };

        const qrToken = jwt.sign(qrPayload, JWT_SECRET, { expiresIn: '365d' }); // Passes rarely expire before event

        // 8. Generate Base64 Image string for frontend rendering using 'qrcode'
        // This allows the Next.js client to render an <img src={qrImageBase64} /> without a separate API call
        const qrImageBase64 = await QRCode.toDataURL(qrToken, {
            color: {
                dark: '#4c1d95',   // deep purple
                light: '#00000000' // transparent
            },
            width: 300,
            margin: 1
        });

        // 9. Finalize linking the token back into the booking row
        await client.query(
            `UPDATE bookings SET qr_token = $1 WHERE id = $2`,
            [qrToken, booking.id]
        );

        // === COMMIT TRANSACTION ===
        await client.query('COMMIT');
        client.release();

        return NextResponse.json(
            {
                message: 'Booking successfully created.',
                booking: {
                    id: booking.id,
                    event_id,
                    seats_booked: seats_requested,
                    payment_utr,
                    payment_verified: false,
                    created_at: booking.created_at,
                    qr_token: qrToken,
                    qr_image_url: qrImageBase64
                }
            },
            { status: 201 }
        );

    } catch (error: any) {
        // === ROLLBACK ON CATASTROPHIC FAILURE ===
        console.error('[Create Booking Transaction Error]:', error.message);
        try {
            await client.query('ROLLBACK');
        } catch (err) {
            console.error('CRITICAL: Failed to rollback connection.');
        } finally {
            client.release();
        }

        return NextResponse.json(
            { error: 'Internal server error while processing booking transaction.' },
            { status: 500 }
        );
    }
}
