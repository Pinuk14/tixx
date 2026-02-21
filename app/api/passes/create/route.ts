import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { decoded, errorResponse } = verifyToken(req);
        if (errorResponse) return errorResponse;

        const userId = decoded!.userId;
        const body = await req.json();
        const { eventId, orderId, seats } = body;

        if (!eventId || !orderId || !seats || !Array.isArray(seats) || seats.length === 0) {
            return NextResponse.json({ error: "Missing required pass data." }, { status: 400 });
        }

        // Insert Pass
        const result = await query(
            `INSERT INTO passes (user_id, event_id, order_id, seats)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [userId, eventId, orderId, JSON.stringify(seats)]
        );

        // Update Event Seat Availability
        await query(
            `UPDATE events
             SET seats_available = GREATEST(0, seats_available - $1)
             WHERE id = $2`,
            [seats.length, eventId]
        );

        return NextResponse.json(
            { message: "Pass generated successfully.", passId: result.rows[0].id },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('[Create Pass API Error]:', error.message);
        return NextResponse.json(
            { error: "Internal server error while creating pass." },
            { status: 500 }
        );
    }
}
