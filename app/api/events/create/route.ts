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
            price_per_seat,
            event_date,
            end_date,
            category,
            currency,
            image_url,
            is_dynamic_pricing,
            dynamic_pricing_strategy,
            form_fields,
            seating_type,
            ticket_tiers,
            seating_config
        } = body;

        const validationError = validateFields(body, ['title', 'location_name', 'upi_id', 'event_date']);
        if (validationError) return validationError;

        // 4. Validate Event Date is Future
        const parsedEventDate = new Date(event_date);
        let parsedEndDate: Date | null = null;

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

        if (end_date) {
            parsedEndDate = new Date(end_date);
            if (isNaN(parsedEndDate.getTime())) {
                return NextResponse.json({ error: 'Invalid end_date format.' }, { status: 400 });
            }
            if (parsedEndDate <= parsedEventDate) {
                return NextResponse.json({ error: 'End date must be after start date.' }, { status: 400 });
            }
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

        // Calculate Seat Logic based on Seating Type
        let processedTotalSeats = null;
        if (seating_type === 'general' && Array.isArray(ticket_tiers)) {
            processedTotalSeats = ticket_tiers.reduce((acc, tier) => acc + (tier.capacity || 0), 0);
        } else if (seating_type === 'matrix' && seating_config?.rows && seating_config?.seatsPerRow) {
            processedTotalSeats = seating_config.rows * seating_config.seatsPerRow;
        } else if (total_seats && total_seats > 0) {
            // Fallback for legacy creation endpoints if they still punch through
            processedTotalSeats = total_seats;
        }

        const processedAvailableSeats = processedTotalSeats; // Available starts identical to Total

        // Calculate a reasonable legacy price_per_seat fallback based on tiers if needed
        const fallbackPrice = (Array.isArray(ticket_tiers) && ticket_tiers.length > 0) 
            ? ticket_tiers[0].price 
            : (price_per_seat || 0);

        // 8. Insert New Event
        const insertResult = await query(
            `INSERT INTO events (
        organizer_id, title, description, location_name, latitude, longitude, 
        total_seats, seats_available, upi_id, price_per_seat, event_date, end_date, category, currency, image_url, is_active, is_dynamic_pricing, dynamic_pricing_strategy, form_fields, seating_type, ticket_tiers, seating_config
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true, $16, $17, $18, $19, $20, $21
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
                fallbackPrice,
                parsedEventDate.toISOString(),
                parsedEndDate ? parsedEndDate.toISOString() : null,
                category || 'Conference',
                currency || 'INR',
                image_url || null,
                is_dynamic_pricing || false,
                dynamic_pricing_strategy || null,
                JSON.stringify(form_fields || ['name', 'email']),
                seating_type || 'general',
                ticket_tiers ? JSON.stringify(ticket_tiers) : null,
                seating_config ? JSON.stringify(seating_config) : null
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
