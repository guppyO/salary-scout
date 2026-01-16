/**
 * One-time setup script to create data_metadata table
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function setup() {
    const client = await pool.connect();
    try {
        // Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS data_metadata (
                id INTEGER PRIMARY KEY DEFAULT 1,
                data_period VARCHAR(20) NOT NULL,
                bls_release_date DATE,
                last_ingested_at TIMESTAMPTZ DEFAULT NOW(),
                last_checked_at TIMESTAMPTZ DEFAULT NOW(),
                record_count INTEGER,
                source_url TEXT,
                CONSTRAINT single_row CHECK (id = 1)
            )
        `);
        console.log('✓ Table created');

        // Insert initial data
        await client.query(`
            INSERT INTO data_metadata (data_period, bls_release_date, record_count, source_url)
            VALUES ('May 2024', '2025-04-02', 141164, 'https://www.bls.gov/oes/special.requests/oesm24ma.zip')
            ON CONFLICT (id) DO UPDATE SET
                data_period = EXCLUDED.data_period,
                bls_release_date = EXCLUDED.bls_release_date,
                record_count = EXCLUDED.record_count,
                source_url = EXCLUDED.source_url,
                last_ingested_at = NOW()
        `);
        console.log('✓ Data inserted');

        // Verify
        const res = await client.query('SELECT * FROM data_metadata');
        console.log('✓ Current metadata:', res.rows[0]);

    } finally {
        client.release();
        await pool.end();
    }
}

setup().catch(console.error);
