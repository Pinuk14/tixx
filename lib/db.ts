import { Pool, QueryResultRow } from 'pg';

if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL environment variable is missing. Database operations will fail at runtime.');
}

// Global cached pool instance to prevent Next.js hot-reloads from exhausting database connections
// We leverage globalThis to reuse the Pool object across API recompilation passes
const globalPool = globalThis as unknown as { pgPool?: Pool };

export const pool =
    globalPool.pgPool ||
    new Pool({
        connectionString: process.env.DATABASE_URL,
        // Optimal default connection pool sizing for serverless/app router 
        max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
    });

// Save to global context only when not in production to prevent memory leaks edge-cases
if (process.env.NODE_ENV !== 'production') {
    globalPool.pgPool = pool;
}

/**
 * Reusable Query Helper Function
 * Automatically handles acquiring and releasing connections from the pool.
 * Safe for raw SQL operations bypassing heavy ORMs.
 * 
 * @param text The raw SQL query string.
 * @param params Optional array of parameter bindings to prevent SQL injection.
 * @returns Standard Postgres Query Result payload.
 */
export async function query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
) {
    const start = Date.now();
    let client;

    try {
        // Acquire a specific dedicated client from the pool
        client = await pool.connect();

        // Execute parameterized raw query
        const res = await client.query<T>(text, params);

        // Non-sensitive execution telemetry 
        const duration = Date.now() - start;
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DB Query Executed] Duration: ${duration}ms | Rows: ${res.rowCount}`);
        }

        return res;
    } catch (error: any) {
        // Highly sanitized Error Handling
        // Mask raw connection strings, usernames, and passwords leaking into Server Logs
        console.error(`[DB Error] An error occurred executing a query.`);
        console.error(`Message: ${error.message || 'Unknown database exception'}`);

        // Re-throw standardized generic version outward to caller
        throw new Error('Database transaction failed. See server logs for details.');
    } finally {
        // ALWAYS release connection back to pool to prevent exhausting connections
        if (client) {
            client.release();
        }
    }
}
