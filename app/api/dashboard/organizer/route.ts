import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const organizerId = decoded!.userId;

        // Fetch events created by this organizer
        const result = await query(
            `SELECT 
                id, 
                title, 
                event_date,
                category,
                total_seats,
                seats_available,
                price_per_seat,
                currency,
                is_active
            FROM events
            WHERE organizer_id = $1
            ORDER BY created_at DESC`,
            [organizerId]
        );

        const events = result.rows;

        // Calculate basic analytics
        let totalRevenue = 0;
        let totalTicketsSold = 0;
        let activeEventsCount = 0;

        const enrichedEvents = events.map(event => {
            if (event.is_active) activeEventsCount++;

            let ticketsSold = 0;
            let revenue = 0;

            if (event.total_seats !== null && event.seats_available !== null) {
                // If the event tracks seats
                ticketsSold = event.total_seats - event.seats_available;
                revenue = ticketsSold * (event.price_per_seat ? parseFloat(event.price_per_seat) : 0);

                totalTicketsSold += ticketsSold;
                // Note: Simplified revenue sum assuming a single base currency for the dashboard stat
                totalRevenue += revenue;
            }

            return {
                id: event.id,
                title: event.title,
                date: event.event_date,
                category: event.category,
                status: event.is_active ? 'Active' : 'Draft',
                ticketsSold,
                totalSeats: event.total_seats || 'Unlimited',
                revenue,
                currency: event.currency || 'INR'
            };
        });

        const analytics = {
            totalRevenue,
            totalTicketsSold,
            activeEventsCount,
            primaryCurrency: enrichedEvents.length > 0 ? enrichedEvents[0].currency : 'INR'
        };

        return NextResponse.json(
            { events: enrichedEvents, analytics },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Organizer Dashboard API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while fetching dashboard data.' },
            { status: 500 }
        );
    }
}
