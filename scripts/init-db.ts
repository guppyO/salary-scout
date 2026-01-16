/**
 * Database Initialization Script for SalaryScout
 *
 * Creates the schema for the salary data tables.
 * Run with: npx tsx scripts/init-db.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const schema = `
-- Drop existing tables if recreating (comment out in production)
-- DROP TABLE IF EXISTS salary_data CASCADE;
-- DROP TABLE IF EXISTS metros CASCADE;
-- DROP TABLE IF EXISTS occupations CASCADE;

-- Occupations lookup table
CREATE TABLE IF NOT EXISTS occupations (
    id SERIAL PRIMARY KEY,
    occ_code VARCHAR(10) UNIQUE NOT NULL,
    occ_title VARCHAR(255) NOT NULL,
    occ_group VARCHAR(20) NOT NULL DEFAULT 'detailed',
    slug VARCHAR(255) UNIQUE NOT NULL,
    major_group VARCHAR(100),
    description TEXT,
    is_indexable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Metro areas lookup table
CREATE TABLE IF NOT EXISTS metros (
    id SERIAL PRIMARY KEY,
    area_code VARCHAR(10) UNIQUE NOT NULL,
    area_title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    state_abbr VARCHAR(5),
    state_name VARCHAR(100),
    is_indexable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Main salary data (occupation × metro combinations)
CREATE TABLE IF NOT EXISTS salary_data (
    id SERIAL PRIMARY KEY,
    occupation_id INTEGER REFERENCES occupations(id) ON DELETE CASCADE,
    metro_id INTEGER REFERENCES metros(id) ON DELETE CASCADE,
    tot_emp INTEGER,
    h_mean DECIMAL(10,2),
    a_mean DECIMAL(12,2),
    a_median DECIMAL(12,2),
    a_pct10 DECIMAL(12,2),
    a_pct25 DECIMAL(12,2),
    a_pct75 DECIMAL(12,2),
    a_pct90 DECIMAL(12,2),
    dqs DECIMAL(3,2) DEFAULT 0.00,
    is_indexable BOOLEAN DEFAULT TRUE,
    data_year INTEGER DEFAULT 2024,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(occupation_id, metro_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_salary_occupation ON salary_data(occupation_id);
CREATE INDEX IF NOT EXISTS idx_salary_metro ON salary_data(metro_id);
CREATE INDEX IF NOT EXISTS idx_salary_indexable ON salary_data(is_indexable) WHERE is_indexable = TRUE;
CREATE INDEX IF NOT EXISTS idx_salary_dqs ON salary_data(dqs) WHERE dqs >= 0.5;
CREATE INDEX IF NOT EXISTS idx_occupations_slug ON occupations(slug);
CREATE INDEX IF NOT EXISTS idx_occupations_indexable ON occupations(is_indexable) WHERE is_indexable = TRUE;
CREATE INDEX IF NOT EXISTS idx_metros_slug ON metros(slug);
CREATE INDEX IF NOT EXISTS idx_metros_state ON metros(state_abbr);
CREATE INDEX IF NOT EXISTS idx_metros_indexable ON metros(is_indexable) WHERE is_indexable = TRUE;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
DROP TRIGGER IF EXISTS update_occupations_updated_at ON occupations;
CREATE TRIGGER update_occupations_updated_at
    BEFORE UPDATE ON occupations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_metros_updated_at ON metros;
CREATE TRIGGER update_metros_updated_at
    BEFORE UPDATE ON metros
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_salary_data_updated_at ON salary_data;
CREATE TRIGGER update_salary_data_updated_at
    BEFORE UPDATE ON salary_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
`;

async function initDb() {
    console.log('🚀 Starting database initialization...');
    console.log('📦 Connecting to Supabase PostgreSQL...');

    const client = await pool.connect();

    try {
        console.log('✅ Connected successfully');
        console.log('📋 Creating schema...');

        await client.query(schema);

        console.log('✅ Schema created successfully');

        // Verify tables exist
        const tablesResult = await client.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('occupations', 'metros', 'salary_data')
            ORDER BY table_name;
        `);

        console.log('\n📊 Tables created:');
        tablesResult.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        // Verify indexes exist
        const indexResult = await client.query(`
            SELECT indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND indexname LIKE 'idx_%'
            ORDER BY indexname;
        `);

        console.log('\n🔍 Indexes created:');
        indexResult.rows.forEach(row => {
            console.log(`   - ${row.indexname}`);
        });

        console.log('\n✅ Database initialization complete!');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

initDb().catch(console.error);
