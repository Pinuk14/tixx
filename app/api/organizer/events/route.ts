import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        // 1. Verify Authentication & Role
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const organizerId = decoded!.userId;

        // 3. Fetch specific events strictly isolated to the requesting Organizer
        const res = await query(
            `SELECT 
         id, 
         title, 
         location_name, 
         total_seats, 
         seats_available, 
         event_date, 
         is_active, 
         created_at
       FROM events
       WHERE organizer_id = $1
       ORDER BY event_date DESC`,
            [organizerId]
        );

        return NextResponse.json(
            {
                events: res.rows,
                count: res.rowCount
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Organizer Events API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while fetching organizer events.' },
            { status: 500 }
        );
    }
}
