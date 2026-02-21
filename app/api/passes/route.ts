import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const { decoded, errorResponse } = verifyToken(req);
        if (errorResponse) return errorResponse;

        const userId = decoded!.userId;

        // Fetch passes joined with event data
        const result = await query(
            `SELECT 
                p.id, 
                p.order_id, 
                p.seats, 
                p.created_at,
                e.title as event_title,
                e.event_date,
                e.location_name
             FROM passes p
             JOIN events e ON p.event_id = e.id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        const passes = result.rows.map(row => ({
            id: row.id,
            orderId: row.order_id,
            seats: row.seats,
            datePurchased: row.created_at,
            eventTitle: row.event_title,
            eventDate: new Date(row.event_date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            }),
            eventTime: "8:00 PM - 12:00 AM", // Placeholder matches our frontend fallback
            eventLocation: row.location_name.split(',')[0], // The venue chunk
            fullLocation: row.location_name
        }));

        return NextResponse.json(
            { passes },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Fetch Passes API Error]:', error.message);
        return NextResponse.json(
            { error: "Internal server error while fetching passes." },
            { status: 500 }
        );
    }
}
