import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { query } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { qr_token } = body;

        if (!qr_token) {
            return NextResponse.json(
                { valid: false, error: 'Missing qr_token in request body.' },
                { status: 400 }
            );
        }

        let decodedToken: any;

        // 1. Cryptographically Verify JWT Signature
        // This automatically rejects expired, malformed, or tampered tokens.
        try {
            decodedToken = jwt.verify(qr_token, JWT_SECRET);
        } catch (err: any) {
            // Differentiate between intentional tampering vs natural expiration
            if (err.name === 'TokenExpiredError') {
                return NextResponse.json({ valid: false, error: 'QR Token has expired.' }, { status: 400 });
            }
            return NextResponse.json({ valid: false, error: 'Invalid or corrupted QR Token.' }, { status: 400 });
        }

        // 2. Extract booking_id from the verified payload
        const bookingId = decodedToken.booking_id;

        if (!bookingId) {
            return NextResponse.json(
                { valid: false, error: 'Malformed payload: Token missing booking reference.' },
                { status: 400 }
            );
        }

        // 3. Fetch Booking Details joined with Event and User
        // Ensures the booking genuinely exists in the database and hasn't been deleted
        const res = await query(
            `SELECT 
         b.id AS booking_id,
         u.name AS user_name,
         e.title AS event_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN events e ON b.event_id = e.id
       WHERE b.id = $1 AND b.qr_token = $2`,
            [bookingId, qr_token]
        );

        if (res.rowCount === 0) {
            return NextResponse.json(
                { valid: false, error: 'No matching booking found for this token. Token may be revoked.' },
                { status: 404 }
            );
        }

        const bookingRecord = res.rows[0];

        // 4. Return Successful Validation
        return NextResponse.json(
            {
                valid: true,
                user_name: bookingRecord.user_name,
                event_name: bookingRecord.event_name
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[QR Validation API Error]:', error.message);
        return NextResponse.json(
            { valid: false, error: 'Internal server error while validating token.' },
            { status: 500 }
        );
    }
}
