import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);

        // Extract potential filters
        const keyword = searchParams.get('keyword');
        const date = searchParams.get('date');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');
        const radiusStr = searchParams.get('radius'); // Default to 50km if lat/lng present

        // Default enforced boundaries
        let sql = `
      SELECT 
        id, 
        title, 
        location_name, 
        seats_available,
        total_seats,
        category,
        image_url,
        price_per_seat,
        currency,
        event_date
      FROM events
      WHERE is_active = true
    `;

        const params: any[] = [];
        let paramIndex = 1;

        // 1. Keyword Filter (Title Case-Insensitive partial match)
        if (keyword) {
            sql += ` AND title ILIKE $${paramIndex}`;
            params.push(`%${keyword}%`);
            paramIndex++;
        }

        // 2. Date Filter (Exact casting to DATE to ignore times)
        if (date) {
            sql += ` AND event_date::DATE = $${paramIndex}::DATE`;
            params.push(date);
            paramIndex++;
        }

        // 3. Geographic Filter using Haversine Formula implicitly in SQL
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusKm = radiusStr ? parseFloat(radiusStr) : 50;

            if (!isNaN(latitude) && !isNaN(longitude)) {
                // Haversine formula calculation logic for km
                // R = 6371 (Earth radius in km)
                sql += ` AND (
          6371 * acos(
            cos(radians($${paramIndex})) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians($${paramIndex + 1})) + 
            sin(radians($${paramIndex})) * 
            sin(radians(latitude))
          )
        ) <= $${paramIndex + 2}`;

                params.push(latitude, longitude, radiusKm);
                paramIndex += 3;
            }
        }

        // Order by descending date to push oldest/expiring out
        sql += ` ORDER BY event_date ASC`;

        // 4. Run dynamic query
        const { rows } = await query(sql, params);

        return NextResponse.json(
            {
                count: rows.length,
                events: rows
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('[Search Events API Error]:', error.message);
        return NextResponse.json(
            { error: 'Internal server error while searching events.' },
            { status: 500 }
        );
    }
}
