import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole, validateFields } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication & Role
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const organizerId = decoded!.userId;

        // 3. Parse and Validate Request Body
        const body = await req.json();
        const {
            title,
            description,
            location_name,
            latitude,
            longitude,
            total_seats,
            upi_id,
            event_date
        } = body;

        const validationError = validateFields(body, ['title', 'location_name', 'upi_id', 'event_date']);
        if (validationError) return validationError;

        // 4. Validate Event Date is Future
        const parsedEventDate = new Date(event_date);
        if (isNaN(parsedEventDate.getTime())) {
            return NextResponse.json({ error: 'Invalid event_date format.' }, { status: 400 });
        }

        const now = new Date();
        if (parsedEventDate <= now) {
            return NextResponse.json(
                { error: 'Invalid event_date. Events must be scheduled in the future.' },
                { status: 400 }
            );
        }

        // 5. Basic UPI Validation (`*@*` pattern)
        const upiRegex = /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/;
        if (!upiRegex.test(upi_id)) {
            return NextResponse.json(
                { error: 'Invalid UPI ID format. Typical format: handle@bank.' },
                { status: 400 }
            );
        }

        // 6. Geographic Coordinate Validation
        let validLat = null;
        let validLng = null;

        if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
            const parsedLat = parseFloat(latitude);
            const parsedLng = parseFloat(longitude);

            if (isNaN(parsedLat) || isNaN(parsedLng)) {
                return NextResponse.json(
                    { error: 'Invalid geographic data. Latitude and longitude must be numbers.' },
                    { status: 400 }
                );
            }

            if (parsedLat < -90 || parsedLat > 90) {
                return NextResponse.json(
                    { error: 'Invalid latitude. Must be between -90 and 90 degrees.' },
                    { status: 400 }
                );
            }

            if (parsedLng < -180 || parsedLng > 180) {
                return NextResponse.json(
                    { error: 'Invalid longitude. Must be between -180 and 180 degrees.' },
                    { status: 400 }
                );
            }

            validLat = parsedLat;
            validLng = parsedLng;
        }

        // 7. Check Active Event Limit (< 3)
        const activeEventsResult = await query(
            `SELECT COUNT(*) as active_count FROM events 
       WHERE organizer_id = $1 AND is_active = true`,
            [organizerId]
        );

        const activeCount = parseInt(activeEventsResult.rows[0].active_count, 10);
        if (activeCount >= 3) {
            return NextResponse.json(
                { error: 'Limit exceeded. Organizers can have a maximum of 3 active events at a time.' },
                { status: 403 } // Forbidden
            );
        }

        // 7. Calculate Seat Logic
        // If total_seats provided => seats_available = total_seats
        // If no seats provided / 0 => calculate as NULL internally for DB
        const processedTotalSeats = (total_seats && total_seats > 0) ? total_seats : null;
        const processedAvailableSeats = processedTotalSeats; // Available starts identical to Total

        // 8. Insert New Event
        const insertResult = await query(
            `INSERT INTO events (
        organizer_id, title, description, location_name, latitude, longitude, 
        total_seats, seats_available, upi_id, event_date, is_active
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true
      ) RETURNING *`,
            [
                organizerId,
                title,
                description || null,
                location_name,
                validLat,
                validLng,
                processedTotalSeats,
                processedAvailableSeats,
                upi_id,
                parsedEventDate.toISOString()
            ]
        );

        const newEvent = insertResult.rows[0];

        // 9. Return Created Resource
        return NextResponse.json(
            {
                message: 'Event created successfully.',
                event: newEvent
            },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('[Create Event API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while creating event.' },
            { status: 500 }
        );
    }
}
