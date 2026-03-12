import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: Request, context: any) {
    try {
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        // Ensure we properly await params in Next 15+
        const params = await context.params;
        const eventId = params.id;
        const organizerId = decoded!.userId;

        // Verify if organizer owns this event
        const eventCheck = await query(
            `SELECT id, title, event_date, form_fields FROM events WHERE id = $1 AND organizer_id = $2`,
            [eventId, organizerId]
        );

        if (eventCheck.rows.length === 0) {
            return NextResponse.json({ error: "Event not found or unauthorized access." }, { status: 403 });
        }

        // Fetch all passes for this event
        const passesResult = await query(
            `SELECT p.id as pass_id, p.order_id, p.seats, p.created_at, u.email as buyer_email
             FROM passes p
             JOIN users u ON p.user_id = u.id
             WHERE p.event_id = $1
             ORDER BY p.created_at DESC`,
            [eventId]
        );

        // Analytics queries
        const viewsCountResult = await query(
            `SELECT COUNT(*) as total_views FROM event_views WHERE event_id = $1`,
            [eventId]
        );
        const totalViews = parseInt(viewsCountResult.rows[0].total_views || '0', 10);

        const attendeesList: any[] = [];
        const bookingHours: Record<number, number> = {};

        passesResult.rows.forEach(pass => {
            const seatsData = typeof pass.seats === 'string' ? JSON.parse(pass.seats) : pass.seats;
            const createdDate = new Date(pass.created_at);
            const hour = createdDate.getHours();
            
            bookingHours[hour] = (bookingHours[hour] || 0) + 1;
            
            // Loop through each seat data (now an object containing name, email, seat)
            if (Array.isArray(seatsData)) {
                seatsData.forEach((attendee: any) => {
                    if (typeof attendee === 'string') {
                        attendeesList.push({
                            orderId: pass.order_id,
                            passId: pass.pass_id,
                            buyerEmail: pass.buyer_email,
                            registeredAt: pass.created_at,
                            seatNumber: attendee,
                            attendeeName: 'Unknown',
                            attendeeEmail: pass.buyer_email
                        });
                    } else {
                        // Spread all fields dynamically, aliasing core fields for backwards compatibility
                        attendeesList.push({
                            ...attendee,
                            orderId: pass.order_id,
                            passId: pass.pass_id,
                            buyerEmail: pass.buyer_email,
                            registeredAt: pass.created_at,
                            seatNumber: attendee.seat,
                            attendeeName: attendee.name || 'Unknown',
                            attendeeEmail: attendee.email || pass.buyer_email
                        });
                    }
                });
            }
        });

        const conversionRate = totalViews > 0 ? ((attendeesList.length / totalViews) * 100).toFixed(1) : 0;
        
        let peakHourStr = "N/A";
        let maxBookings = 0;
        for (const [hourStr, count] of Object.entries(bookingHours)) {
            if (count > maxBookings) {
                maxBookings = count;
                const h = parseInt(hourStr);
                const ampm = h >= 12 ? 'PM' : 'AM';
                const h12 = h % 12 || 12;
                peakHourStr = `${h12} ${ampm}`;
            }
        }

        return NextResponse.json(
            { 
                event: eventCheck.rows[0], 
                attendees: attendeesList,
                analytics: {
                    totalViews,
                    conversionRate,
                    peakBookingTime: peakHourStr
                }
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Event Attendees API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while fetching attendees.' },
            { status: 500 }
        );
    }
}
