import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(req: Request, context: any) {
    try {
        const params = await context.params;
        const eventId = params.id;
        
        const body = await req.json();
        const { viewerId } = body;

        if (!viewerId) {
            return NextResponse.json({ error: "Missing viewerId" }, { status: 400 });
        }

        // Verify event exists
        const eventCheck = await query(`SELECT id FROM events WHERE id = $1`, [eventId]);
        if (eventCheck.rows.length === 0) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Log the view
        await query(
            `INSERT INTO event_views (event_id, viewer_id) VALUES ($1, $2)`,
            [eventId, viewerId]
        );

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error: any) {
        console.error('[Event View API Error]:', error.message);
        return NextResponse.json({ error: 'Internal server error while logging view.' }, { status: 500 });
    }
}
