/**
 * BLS Data Update Checker
 *
 * Checks the BLS OEWS tables page for new data releases.
 * Compares with current data_metadata to determine if update is needed.
 *
 * Usage:
 *   npx tsx scripts/check-bls-update.ts
 *
 * Exit codes:
 *   0 - No update needed (or check successful)
 *   1 - New data available
 *   2 - Error occurred
 */

import { Pool } from 'pg';

// BLS OEWS data page URL
const BLS_OEWS_URL = 'https://www.bls.gov/oes/tables.htm';

// Pattern to match OEWS data releases (e.g., "May 2024", "May 2025")
const DATA_PERIOD_PATTERN = /May\s+(\d{4})/gi;

// Download URL pattern (e.g., oesm24ma.zip for May 2024)
const DOWNLOAD_URL_PATTERN = /oesm(\d{2})ma\.zip/gi;

interface DataMetadata {
    data_period: string;
    bls_release_date: string | null;
    last_checked_at: string;
}

interface CheckResult {
    hasUpdate: boolean;
    currentPeriod: string;
    latestPeriod: string | null;
    downloadUrl: string | null;
    error: string | null;
}

/**
 * Fetch the BLS OEWS tables page and extract the latest data period
 */
async function fetchLatestBLSPeriod(): Promise<{ period: string; downloadUrl: string } | null> {
    try {
        const response = await fetch(BLS_OEWS_URL, {
            headers: {
                'User-Agent': 'SalaryScout Data Checker (+https://salaryscout.com)',
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch BLS page: ${response.status}`);
            return null;
        }

        const html = await response.text();

        // Find all mentions of data periods
        const periods: string[] = [];
        let match;

        while ((match = DATA_PERIOD_PATTERN.exec(html)) !== null) {
            periods.push(`May ${match[1]}`);
        }

        // Find download URLs
        const urls: { year: number; url: string }[] = [];
        DOWNLOAD_URL_PATTERN.lastIndex = 0;

        while ((match = DOWNLOAD_URL_PATTERN.exec(html)) !== null) {
            const yearShort = parseInt(match[1]);
            const yearFull = yearShort >= 90 ? 1900 + yearShort : 2000 + yearShort;
            urls.push({
                year: yearFull,
                url: `https://www.bls.gov/oes/special.requests/oesm${match[1]}ma.zip`,
            });
        }

        if (periods.length === 0) {
            console.error('No data periods found on BLS page');
            return null;
        }

        // Get the most recent period (highest year)
        const sortedPeriods = [...new Set(periods)].sort((a, b) => {
            const yearA = parseInt(a.split(' ')[1]);
            const yearB = parseInt(b.split(' ')[1]);
            return yearB - yearA;
        });

        const latestPeriod = sortedPeriods[0];
        const latestYear = parseInt(latestPeriod.split(' ')[1]);

        // Find matching download URL
        const matchingUrl = urls.find(u => u.year === latestYear);

        return {
            period: latestPeriod,
            downloadUrl: matchingUrl?.url || `https://www.bls.gov/oes/special.requests/oesm${String(latestYear).slice(-2)}ma.zip`,
        };
    } catch (error) {
        console.error('Error fetching BLS page:', error);
        return null;
    }
}

/**
 * Get current data metadata from database
 */
async function getCurrentMetadata(): Promise<DataMetadata | null> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('DATABASE_URL not set');
        return null;
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 1,
    });

    try {
        const result = await pool.query(
            'SELECT data_period, bls_release_date, last_checked_at FROM data_metadata WHERE id = 1'
        );

        if (result.rows.length === 0) {
            // Return default if table is empty
            return {
                data_period: 'May 2024',
                bls_release_date: null,
                last_checked_at: new Date().toISOString(),
            };
        }

        return result.rows[0];
    } catch (error: any) {
        // Table might not exist yet
        if (error.code === '42P01') {
            console.log('data_metadata table does not exist yet');
            return {
                data_period: 'May 2024',
                bls_release_date: null,
                last_checked_at: new Date().toISOString(),
            };
        }
        console.error('Database error:', error);
        return null;
    } finally {
        await pool.end();
    }
}

/**
 * Update the last_checked_at timestamp
 */
async function updateLastChecked(): Promise<void> {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) return;

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 1,
    });

    try {
        await pool.query(
            'UPDATE data_metadata SET last_checked_at = NOW() WHERE id = 1'
        );
    } catch {
        // Ignore errors
    } finally {
        await pool.end();
    }
}

/**
 * Compare two data periods (e.g., "May 2024" vs "May 2025")
 */
function comparePeriods(current: string, latest: string): number {
    const currentYear = parseInt(current.split(' ')[1]);
    const latestYear = parseInt(latest.split(' ')[1]);
    return latestYear - currentYear;
}

/**
 * Main check function
 */
async function checkForUpdate(): Promise<CheckResult> {
    // Get current metadata
    const metadata = await getCurrentMetadata();

    if (!metadata) {
        return {
            hasUpdate: false,
            currentPeriod: 'Unknown',
            latestPeriod: null,
            downloadUrl: null,
            error: 'Failed to get current metadata',
        };
    }

    // Fetch latest from BLS
    const latest = await fetchLatestBLSPeriod();

    // Update last checked timestamp
    await updateLastChecked();

    if (!latest) {
        return {
            hasUpdate: false,
            currentPeriod: metadata.data_period,
            latestPeriod: null,
            downloadUrl: null,
            error: 'Failed to fetch BLS data',
        };
    }

    // Compare periods
    const diff = comparePeriods(metadata.data_period, latest.period);

    return {
        hasUpdate: diff > 0,
        currentPeriod: metadata.data_period,
        latestPeriod: latest.period,
        downloadUrl: latest.downloadUrl,
        error: null,
    };
}

// Run the check
async function main() {
    console.log('🔍 Checking BLS for OEWS data updates...\n');

    const result = await checkForUpdate();

    if (result.error) {
        console.error(`❌ Error: ${result.error}`);
        process.exit(2);
    }

    console.log(`📊 Current data period: ${result.currentPeriod}`);
    console.log(`🌐 Latest BLS period:   ${result.latestPeriod}`);

    if (result.hasUpdate) {
        console.log(`\n✅ NEW DATA AVAILABLE!`);
        console.log(`📥 Download URL: ${result.downloadUrl}`);
        console.log(`\nRun the ingestion script to update:`);
        console.log(`  npx tsx scripts/ingest-data.ts`);

        // Output for GitHub Actions
        if (process.env.GITHUB_OUTPUT) {
            const fs = await import('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_update=true\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `latest_period=${result.latestPeriod}\n`);
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `download_url=${result.downloadUrl}\n`);
        }

        process.exit(1); // Exit 1 = update available
    } else {
        console.log(`\n✓ Data is up to date. No update needed.`);

        // Output for GitHub Actions
        if (process.env.GITHUB_OUTPUT) {
            const fs = await import('fs');
            fs.appendFileSync(process.env.GITHUB_OUTPUT, `has_update=false\n`);
        }

        process.exit(0); // Exit 0 = no update
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(2);
});
