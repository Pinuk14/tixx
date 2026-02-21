import { pool } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const id = resolvedParams.id;

        // Return 400 if bad UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
            return NextResponse.json({ error: "Invalid Event ID format." }, { status: 400 });
        }

        const query = `
            SELECT 
                id, 
                title, 
                location_name, 
                latitude, 
                longitude, 
                event_date,
                end_date,
                category,
                total_seats,
                seats_available,
                price_per_seat,
                currency,
                image_url,
                is_dynamic_pricing,
                dynamic_pricing_strategy,
                organizer_id
            FROM events
            WHERE id = $1
            LIMIT 1;
        `;

        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Event not found." }, { status: 404 });
        }

        return NextResponse.json({ event: result.rows[0] }, { status: 200 });
    } catch (error: any) {
        console.error("Fetch Event details error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { decoded, errorResponse } = requireRole(req, 'organizer');
        if (errorResponse) return errorResponse;

        const organizerId = decoded!.userId;
        const resolvedParams = await params;
        const eventId = resolvedParams.id;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(eventId)) {
            return NextResponse.json({ error: "Invalid Event ID format." }, { status: 400 });
        }

        // Check if the event exists and belongs to the organizer
        const result = await pool.query(`SELECT id FROM events WHERE id = $1 AND organizer_id = $2`, [eventId, organizerId]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Event not found or unauthorized to delete." }, { status: 403 });
        }

        // Proceed to delete
        await pool.query(`DELETE FROM events WHERE id = $1`, [eventId]);

        return NextResponse.json({ message: "Event deleted successfully." }, { status: 200 });
    } catch (error: any) {
        console.error("Delete Event error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
