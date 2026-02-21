
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
