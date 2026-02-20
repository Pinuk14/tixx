import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;

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
                total_seats,
                seats_available,
                price_per_seat 
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
