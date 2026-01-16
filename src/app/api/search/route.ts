/**
 * Search API Route
 *
 * Searches occupations, metros, and salary combinations
 * Returns results for autocomplete and search page
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface SearchResult {
    type: 'occupation' | 'location' | 'salary';
    title: string;
    subtitle?: string;
    href: string;
    salary?: string;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q')?.trim() || '';
    const location = searchParams.get('location')?.trim() || '';

    if (!q && !location) {
        return NextResponse.json({ results: [] });
    }

    const results: SearchResult[] = [];

    try {
        // If both job and location provided, search for specific salary pages
        if (q && location) {
            const salaryResults = await query<{
                occ_title: string;
                occ_slug: string;
                area_title: string;
                metro_slug: string;
                a_median: number;
            }>(`
                SELECT
                    o.occ_title,
                    o.slug as occ_slug,
                    m.area_title,
                    m.slug as metro_slug,
                    sd.a_median
                FROM salary_data sd
                JOIN occupations o ON sd.occupation_id = o.id
                JOIN metros m ON sd.metro_id = m.id
                WHERE sd.is_indexable = TRUE
                    AND (o.occ_title ILIKE $1 OR o.slug ILIKE $1)
                    AND (m.area_title ILIKE $2 OR m.slug ILIKE $2)
                ORDER BY sd.tot_emp DESC NULLS LAST
                LIMIT 20
            `, [`%${q}%`, `%${location}%`]);

            for (const row of salaryResults) {
                results.push({
                    type: 'salary',
                    title: row.occ_title,
                    subtitle: row.area_title,
                    href: `/salary/${row.occ_slug}/${row.metro_slug}`,
                    salary: formatSalary(row.a_median),
                });
            }
        }

        // Search occupations if job query provided
        if (q && results.length < 20) {
            const occupationResults = await query<{
                occ_title: string;
                slug: string;
            }>(`
                SELECT occ_title, slug
                FROM occupations
                WHERE is_indexable = TRUE
                    AND (occ_title ILIKE $1 OR slug ILIKE $1)
                ORDER BY
                    CASE WHEN occ_title ILIKE $2 THEN 0 ELSE 1 END,
                    occ_title
                LIMIT $3
            `, [`%${q}%`, `${q}%`, 20 - results.length]);

            for (const row of occupationResults) {
                results.push({
                    type: 'occupation',
                    title: row.occ_title,
                    subtitle: 'View salary data across all locations',
                    href: `/occupations/${row.slug}`,
                });
            }
        }

        // Search locations if location query provided (or if only q provided and few results)
        if ((location || (q && results.length < 10)) && results.length < 20) {
            const searchTerm = location || q;
            const locationResults = await query<{
                area_title: string;
                slug: string;
                state_abbr: string | null;
            }>(`
                SELECT area_title, slug, state_abbr
                FROM metros
                WHERE is_indexable = TRUE
                    AND (area_title ILIKE $1 OR slug ILIKE $1 OR state_abbr ILIKE $1)
                ORDER BY
                    CASE WHEN area_title ILIKE $2 THEN 0 ELSE 1 END,
                    area_title
                LIMIT $3
            `, [`%${searchTerm}%`, `${searchTerm}%`, 20 - results.length]);

            for (const row of locationResults) {
                results.push({
                    type: 'location',
                    title: row.area_title,
                    subtitle: row.state_abbr || 'View all salaries in this area',
                    href: `/locations/${row.slug}`,
                });
            }
        }

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json(
            { error: 'Search failed', results: [] },
            { status: 500 }
        );
    }
}

function formatSalary(amount: number | null): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}
