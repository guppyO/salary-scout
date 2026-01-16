/**
 * Data Ingestion Script for SalaryScout
 *
 * Imports BLS OEWS metro area data into the database.
 * Run with: npx tsx scripts/ingest-data.ts
 *
 * Options:
 *   --dry-run    Only process first 100 rows (for testing)
 *   --full       Process all data (default)
 */

import { Pool } from 'pg';
import * as XLSX from 'xlsx';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Command line args
const isDryRun = process.argv.includes('--dry-run');
const DRY_RUN_LIMIT = 100;

// Slug generation
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 200);
}

// Extract state abbreviation from area title (e.g., "New York-Newark-Jersey City, NY-NJ-PA" -> "NY")
function extractStateAbbr(areaTitle: string): string | null {
    const match = areaTitle.match(/,\s*([A-Z]{2})(?:-[A-Z]{2})*$/);
    return match ? match[1] : null;
}

// Calculate Data Quality Score (0-1)
function calculateDQS(row: any): number {
    let score = 0;

    // Has employment data (30%)
    if (row.TOT_EMP && !isNaN(parseFloat(row.TOT_EMP)) && parseFloat(row.TOT_EMP) > 0) {
        score += 0.30;
    }

    // Has mean salary (25%)
    if (row.A_MEAN && !isNaN(parseFloat(row.A_MEAN)) && parseFloat(row.A_MEAN) > 0) {
        score += 0.25;
    }

    // Has median salary (20%)
    if (row.A_MEDIAN && !isNaN(parseFloat(row.A_MEDIAN)) && parseFloat(row.A_MEDIAN) > 0) {
        score += 0.20;
    }

    // Has wage percentiles (15%)
    const hasPct10 = row.A_PCT10 && !isNaN(parseFloat(row.A_PCT10));
    const hasPct25 = row.A_PCT25 && !isNaN(parseFloat(row.A_PCT25));
    const hasPct75 = row.A_PCT75 && !isNaN(parseFloat(row.A_PCT75));
    const hasPct90 = row.A_PCT90 && !isNaN(parseFloat(row.A_PCT90));
    if (hasPct10 && hasPct25 && hasPct75 && hasPct90) {
        score += 0.15;
    }

    // Has significant employment (10%)
    if (row.TOT_EMP && parseFloat(row.TOT_EMP) >= 100) {
        score += 0.10;
    }

    return Math.round(score * 100) / 100;
}

// Parse numeric value, handling special BLS codes
function parseNum(val: any): number | null {
    if (val === null || val === undefined || val === '' || val === '*' || val === '**' || val === '#') {
        return null;
    }
    const num = parseFloat(String(val).replace(/,/g, ''));
    return isNaN(num) ? null : num;
}

interface OccupationRow {
    occ_code: string;
    occ_title: string;
    occ_group: string;
    slug: string;
}

interface MetroRow {
    area_code: string;
    area_title: string;
    slug: string;
    state_abbr: string | null;
}

interface SalaryRow {
    occ_code: string;
    area_code: string;
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

async function ingestData() {
    console.log('🚀 Starting data ingestion...');
    console.log(`📋 Mode: ${isDryRun ? 'DRY RUN (100 rows)' : 'FULL IMPORT'}`);

    const client = await pool.connect();

    try {
        // Read Excel file
        const filePath = resolve(__dirname, '../data/oesm24ma/MSA_M2024_dl.xlsx');
        console.log(`📂 Reading file: ${filePath}`);

        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(sheet);

        console.log(`📊 Total rows in file: ${rawData.length}`);

        // Filter for detailed occupations only and limit for dry run
        let data = rawData.filter((row: any) =>
            row.OCC_GROUP === 'detailed' || row.O_GROUP === 'detailed'
        );

        if (isDryRun) {
            data = data.slice(0, DRY_RUN_LIMIT);
            console.log(`🧪 Dry run: Processing ${data.length} rows`);
        } else {
            console.log(`📊 Detailed occupation rows: ${data.length}`);
        }

        // Extract unique occupations
        const occupationsMap = new Map<string, OccupationRow>();
        const metrosMap = new Map<string, MetroRow>();
        const salaryRows: SalaryRow[] = [];

        console.log('🔄 Processing rows...');

        for (const row of data as any[]) {
            const occCode = row.OCC_CODE || row.occ_code;
            const occTitle = row.OCC_TITLE || row.occ_title;
            const occGroup = row.OCC_GROUP || row.O_GROUP || 'detailed';
            const areaCode = row.AREA || row.area || row.AREA_CODE;
            const areaTitle = row.AREA_TITLE || row.area_title || row.AREA_NAME;

            if (!occCode || !areaCode) continue;

            // Add to occupations map
            if (!occupationsMap.has(occCode)) {
                occupationsMap.set(occCode, {
                    occ_code: occCode,
                    occ_title: occTitle,
                    occ_group: occGroup,
                    slug: generateSlug(occTitle)
                });
            }

            // Add to metros map
            if (!metrosMap.has(areaCode)) {
                metrosMap.set(areaCode, {
                    area_code: areaCode,
                    area_title: areaTitle,
                    slug: generateSlug(areaTitle),
                    state_abbr: extractStateAbbr(areaTitle)
                });
            }

            // Calculate DQS
            const dqs = calculateDQS(row);
            const aMedian = parseNum(row.A_MEDIAN);
            const isIndexable = dqs >= 0.50 && aMedian !== null && aMedian > 0;

            // Add salary row
            salaryRows.push({
                occ_code: occCode,
                area_code: areaCode,
                tot_emp: parseNum(row.TOT_EMP),
                h_mean: parseNum(row.H_MEAN),
                a_mean: parseNum(row.A_MEAN),
                a_median: aMedian,
                a_pct10: parseNum(row.A_PCT10),
                a_pct25: parseNum(row.A_PCT25),
                a_pct75: parseNum(row.A_PCT75),
                a_pct90: parseNum(row.A_PCT90),
                dqs,
                is_indexable: isIndexable
            });
        }

        console.log(`✅ Found ${occupationsMap.size} unique occupations`);
        console.log(`✅ Found ${metrosMap.size} unique metro areas`);
        console.log(`✅ Processed ${salaryRows.length} salary records`);

        // Begin transaction
        await client.query('BEGIN');

        // Insert occupations
        console.log('📥 Inserting occupations...');
        const occupations = Array.from(occupationsMap.values());
        for (const occ of occupations) {
            await client.query(`
                INSERT INTO occupations (occ_code, occ_title, occ_group, slug)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (occ_code) DO UPDATE SET
                    occ_title = EXCLUDED.occ_title,
                    occ_group = EXCLUDED.occ_group,
                    slug = EXCLUDED.slug
            `, [occ.occ_code, occ.occ_title, occ.occ_group, occ.slug]);
        }
        console.log(`✅ Inserted ${occupations.length} occupations`);

        // Insert metros
        console.log('📥 Inserting metro areas...');
        const metros = Array.from(metrosMap.values());
        for (const metro of metros) {
            await client.query(`
                INSERT INTO metros (area_code, area_title, slug, state_abbr)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (area_code) DO UPDATE SET
                    area_title = EXCLUDED.area_title,
                    slug = EXCLUDED.slug,
                    state_abbr = EXCLUDED.state_abbr
            `, [metro.area_code, metro.area_title, metro.slug, metro.state_abbr]);
        }
        console.log(`✅ Inserted ${metros.length} metro areas`);

        // Get occupation and metro ID mappings
        const occIdMap = new Map<string, number>();
        const metroIdMap = new Map<string, number>();

        const occResult = await client.query('SELECT id, occ_code FROM occupations');
        for (const row of occResult.rows) {
            occIdMap.set(row.occ_code, row.id);
        }

        const metroResult = await client.query('SELECT id, area_code FROM metros');
        for (const row of metroResult.rows) {
            metroIdMap.set(row.area_code, row.id);
        }

        // Insert salary data in batches
        console.log('📥 Inserting salary data...');
        const BATCH_SIZE = 1000;
        let inserted = 0;

        for (let i = 0; i < salaryRows.length; i += BATCH_SIZE) {
            const batch = salaryRows.slice(i, i + BATCH_SIZE);

            for (const row of batch) {
                const occId = occIdMap.get(row.occ_code);
                const metroId = metroIdMap.get(row.area_code);

                if (!occId || !metroId) continue;

                await client.query(`
                    INSERT INTO salary_data (
                        occupation_id, metro_id, tot_emp, h_mean, a_mean, a_median,
                        a_pct10, a_pct25, a_pct75, a_pct90, dqs, is_indexable
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (occupation_id, metro_id) DO UPDATE SET
                        tot_emp = EXCLUDED.tot_emp,
                        h_mean = EXCLUDED.h_mean,
                        a_mean = EXCLUDED.a_mean,
                        a_median = EXCLUDED.a_median,
                        a_pct10 = EXCLUDED.a_pct10,
                        a_pct25 = EXCLUDED.a_pct25,
                        a_pct75 = EXCLUDED.a_pct75,
                        a_pct90 = EXCLUDED.a_pct90,
                        dqs = EXCLUDED.dqs,
                        is_indexable = EXCLUDED.is_indexable,
                        updated_at = NOW()
                `, [
                    occId, metroId, row.tot_emp, row.h_mean, row.a_mean, row.a_median,
                    row.a_pct10, row.a_pct25, row.a_pct75, row.a_pct90, row.dqs, row.is_indexable
                ]);
                inserted++;
            }

            console.log(`   Progress: ${Math.min(i + BATCH_SIZE, salaryRows.length)}/${salaryRows.length} rows`);
        }

        // Commit transaction
        await client.query('COMMIT');
        console.log(`✅ Inserted ${inserted} salary records`);

        // Summary stats
        const statsResult = await client.query(`
            SELECT
                (SELECT count(*) FROM occupations) as occupations,
                (SELECT count(*) FROM metros) as metros,
                (SELECT count(*) FROM salary_data) as salary_records,
                (SELECT count(*) FROM salary_data WHERE is_indexable = TRUE) as indexable_pages
        `);

        console.log('\n📊 Database Summary:');
        console.log(`   Occupations: ${statsResult.rows[0].occupations}`);
        console.log(`   Metro areas: ${statsResult.rows[0].metros}`);
        console.log(`   Salary records: ${statsResult.rows[0].salary_records}`);
        console.log(`   Indexable pages: ${statsResult.rows[0].indexable_pages}`);

        console.log('\n✅ Data ingestion complete!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Error during ingestion:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

ingestData().catch(console.error);
