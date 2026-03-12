
import { pool } from '../lib/db';

async function migrate() {
    console.log("Starting DB Migration...");
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Add price_per_seat if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS price_per_seat DECIMAL(10, 2) DEFAULT 0.00;
        `);
        console.log("Added price_per_seat column to events table.");

        // Add end_date if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
        `);
        console.log("Added end_date column to events table.");

        // Add category if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Conference';
        `);
        console.log("Added category column to events table.");

        // Add currency if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';
        `);
        console.log("Added currency column to events table.");

        // Add image_url if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
        `);
        console.log("Added image_url column to events table.");

        // Add is_dynamic_pricing if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS is_dynamic_pricing BOOLEAN DEFAULT FALSE;
        `);
        console.log("Added is_dynamic_pricing column to events table.");

        // Add dynamic_pricing_strategy if it doesn't exist
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS dynamic_pricing_strategy VARCHAR(50);
        `);
        console.log("Added dynamic_pricing_strategy column to events table.");

        // Add form_fields if it doesn't exist to track custom attendee info required
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS form_fields JSONB DEFAULT '["name", "email"]'::jsonb;
        `);
        console.log("Added form_fields column to events table.");

        // --- Seating System Redesign Columns ---
        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS seating_type VARCHAR(50) DEFAULT 'general';
        `);
        console.log("Added seating_type column to events table.");

        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS ticket_tiers JSONB;
        `);
        console.log("Added ticket_tiers column to events table.");

        await client.query(`
            ALTER TABLE events 
            ADD COLUMN IF NOT EXISTS seating_config JSONB;
        `);
        console.log("Added seating_config column to events table.");

        // Table for Event Views
        await client.query(`
            CREATE TABLE IF NOT EXISTS event_views (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                viewer_id VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Event views table ensured.");

        // Table for Passes
        await client.query(`
            CREATE TABLE IF NOT EXISTS passes (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                event_id UUID REFERENCES events(id) ON DELETE CASCADE,
                order_id VARCHAR(255) NOT NULL,
                seats JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Passes table ensured.");

        await client.query("COMMIT");
        console.log("Migration successful!");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("Migration failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
