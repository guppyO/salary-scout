/**
 * Database connection utility for SalaryScout
 * Uses connection pooling for Supabase PostgreSQL
 */

import { Pool } from 'pg';

// Connection pool singleton
let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            // Low max to avoid connection exhaustion during builds
            max: 2,
            idleTimeoutMillis: 10000,
            connectionTimeoutMillis: 30000,
        });
    }
    return pool;
}

/**
 * Execute a query with automatic connection handling and retry
 */
export async function query<T = any>(
    sql: string,
    params?: any[],
    retries = 3
): Promise<T[]> {
    const pool = getPool();
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const result = await pool.query(sql, params);
            return result.rows;
        } catch (error: any) {
            // Retry on connection errors
            if (attempt < retries && error.code === '53300') {
                await new Promise(r => setTimeout(r, 1000 * attempt));
                continue;
            }
            throw error;
        }
    }
    return [];
}

/**
 * Execute a single-row query
 */
export async function queryOne<T = any>(
    sql: string,
    params?: any[]
): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] || null;
}

// Types for common queries
export interface Occupation {
    id: number;
    occ_code: string;
    occ_title: string;
    slug: string;
    occ_group: string;
}

export interface Metro {
    id: number;
    area_code: string;
    area_title: string;
    slug: string;
    state_abbr: string | null;
}

export interface SalaryData {
    id: number;
    occupation_id: number;
    metro_id: number;
    tot_emp: number | null;
    h_mean: number | null;
    a_mean: number | null;
    a_median: number | null;
    a_pct10: number | null;
    a_pct25: number | null;
    a_pct75: number | null;
    a_pct90: number | null;
    dqs: number;
    is_indexable: boolean;
}

export interface SalaryPageData extends SalaryData {
    occ_title: string;
    occ_slug: string;
    occ_code: string;
    area_title: string;
    metro_slug: string;
    state_abbr: string | null;
}

export interface DataMetadata {
    id: number;
    data_period: string;
    bls_release_date: string | null;
    last_ingested_at: string;
    last_checked_at: string;
    record_count: number | null;
    source_url: string | null;
}

/**
 * Get current data metadata (period, last update, etc.)
 */
export async function getDataMetadata(): Promise<DataMetadata | null> {
    try {
        return await queryOne<DataMetadata>(
            'SELECT * FROM data_metadata WHERE id = 1'
        );
    } catch {
        // Table might not exist yet - return default
        return {
            id: 1,
            data_period: 'May 2024',
            bls_release_date: '2025-04-02',
            last_ingested_at: new Date().toISOString(),
            last_checked_at: new Date().toISOString(),
            record_count: 141164,
            source_url: null,
        };
    }
}

/**
 * Update the last_checked_at timestamp
 */
export async function updateLastChecked(): Promise<void> {
    await query(
        'UPDATE data_metadata SET last_checked_at = NOW() WHERE id = 1'
    );
}

/**
 * Update data metadata after successful ingestion
 */
export async function updateDataMetadata(
    dataPeriod: string,
    blsReleaseDate: string | null,
    recordCount: number,
    sourceUrl: string
): Promise<void> {
    await query(
        `INSERT INTO data_metadata (id, data_period, bls_release_date, record_count, source_url, last_ingested_at, last_checked_at)
         VALUES (1, $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET
            data_period = $1,
            bls_release_date = $2,
            record_count = $3,
            source_url = $4,
            last_ingested_at = NOW(),
            last_checked_at = NOW()`,
        [dataPeriod, blsReleaseDate, recordCount, sourceUrl]
    );
}
