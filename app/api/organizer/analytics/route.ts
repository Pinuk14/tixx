import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        // 1. Verify Authentication & Role
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const organizerId = decoded!.userId;

        // 3. Aggregate Global Lifetime KPIs
        const kpiRes = await query(
            `SELECT 
         COALESCE(SUM(b.seats_booked), 0) AS lifetime_bookings,
         -- Note: Revenue is tracked logically: assuming flat 49/ticket base_price for mock demo
         COALESCE(SUM(b.seats_booked) * 49, 0) AS lifetime_revenue
       FROM bookings b
       JOIN events e ON b.event_id = e.id
       WHERE e.organizer_id = $1`,
            [organizerId]
        );

        const lifetimeStats = kpiRes.rows[0];

        // 4. Fetch Per-Event Granular Analytics List (Occupancy Math)
        const eventsRes = await query(
            `SELECT 
         e.id,
         e.title,
         e.total_seats,
         e.seats_available,
         COALESCE(SUM(b.seats_booked), 0) AS total_booked
       FROM events e
       LEFT JOIN bookings b ON e.id = b.event_id
       WHERE e.organizer_id = $1
       GROUP BY e.id, e.title, e.total_seats, e.seats_available
       ORDER BY e.created_at DESC`,
            [organizerId]
        );

        // 5. Calculate floating point percentages
        const mappedEvents = eventsRes.rows.map(event => {
            let occupancyPercentage = 0;

            // Prevent division by zero and handle unbounded implicitly NULL events
            if (event.total_seats && event.total_seats > 0) {
                occupancyPercentage = ((event.total_seats - event.seats_available) / event.total_seats) * 100;
            } else if (event.total_booked > 0) {
                // If no seat limits but bookings exist, track it as purely positive growth unbounded
                occupancyPercentage = 100; // or undefined based on preference
            }

            return {
                event_id: event.id,
                title: event.title,
                total_seats: event.total_seats || 'Unlimited',
                seats_booked: parseInt(event.total_booked, 10),
                occupancy_rate: parseFloat(occupancyPercentage.toFixed(1))
            };
        });

        return NextResponse.json(
            {
                global_stats: {
                    lifetime_bookings: parseInt(lifetimeStats.lifetime_bookings, 10),
                    lifetime_estimated_revenue: parseInt(lifetimeStats.lifetime_revenue, 10)
                },
                event_breakdown: mappedEvents
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Organizer Analytics API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while compiling analytics.' },
            { status: 500 }
        );
    }
}
