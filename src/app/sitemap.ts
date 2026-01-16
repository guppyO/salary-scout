/**
 * Dynamic Sitemap for SalaryScout
 *
 * Generates paginated sitemaps since we have 138K+ indexable URLs.
 * Vercel ISR limit: ~19MB per page, so we use 10K URLs per sitemap (~6MB each)
 */

import type { MetadataRoute } from 'next';
import { query } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revenue-explorer-new.vercel.app';
const URLS_PER_SITEMAP = 10000;

export default async function sitemap(props: {
    id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
    const idStr = await props.id;
    const id = parseInt(idStr, 10);

    // First sitemap (id=0) includes static pages + occupations + metros + start of salary pages
    if (id === 0) {
        const staticPages: MetadataRoute.Sitemap = [
            {
                url: SITE_URL,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 1.0,
            },
            {
                url: `${SITE_URL}/occupations`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.9,
            },
            {
                url: `${SITE_URL}/locations`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.9,
            },
        ];

        const occupations = await query<{ slug: string }>(`
            SELECT slug FROM occupations
            WHERE is_indexable = TRUE
            ORDER BY slug
        `);

        const occupationPages: MetadataRoute.Sitemap = occupations.map(occ => ({
            url: `${SITE_URL}/occupations/${occ.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }));

        const metros = await query<{ slug: string }>(`
            SELECT slug FROM metros
            WHERE is_indexable = TRUE
            ORDER BY slug
        `);

        const metroPages: MetadataRoute.Sitemap = metros.map(metro => ({
            url: `${SITE_URL}/locations/${metro.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }));

        const usedSlots = staticPages.length + occupationPages.length + metroPages.length;
        const remainingSlots = Math.max(0, URLS_PER_SITEMAP - usedSlots);

        const salaryPages = await query<{ occ_slug: string; metro_slug: string }>(`
            SELECT o.slug as occ_slug, m.slug as metro_slug
            FROM salary_data sd
            JOIN occupations o ON sd.occupation_id = o.id
            JOIN metros m ON sd.metro_id = m.id
            WHERE sd.is_indexable = TRUE
            ORDER BY sd.tot_emp DESC NULLS LAST
            LIMIT $1
        `, [remainingSlots]);

        const salaryUrls: MetadataRoute.Sitemap = salaryPages.map(page => ({
            url: `${SITE_URL}/salary/${page.occ_slug}/${page.metro_slug}`,
            lastModified: new Date(),
            changeFrequency: 'yearly' as const,
            priority: 0.7,
        }));

        return [...staticPages, ...occupationPages, ...metroPages, ...salaryUrls];
    }

    // Subsequent sitemaps: only salary pages with pagination
    const staticAndCategoryCount = 3 + 823 + 393; // ~1219 pages in sitemap 0
    const firstSitemapSalaryCount = URLS_PER_SITEMAP - staticAndCategoryCount;
    const salaryOffset = firstSitemapSalaryCount + (id - 1) * URLS_PER_SITEMAP;

    const salaryPages = await query<{ occ_slug: string; metro_slug: string }>(`
        SELECT o.slug as occ_slug, m.slug as metro_slug
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.is_indexable = TRUE
        ORDER BY sd.tot_emp DESC NULLS LAST
        LIMIT $1 OFFSET $2
    `, [URLS_PER_SITEMAP, salaryOffset]);

    return salaryPages.map(page => ({
        url: `${SITE_URL}/salary/${page.occ_slug}/${page.metro_slug}`,
        lastModified: new Date(),
        changeFrequency: 'yearly' as const,
        priority: 0.7,
    }));
}

export async function generateSitemaps(): Promise<{ id: number }[]> {
    const result = await query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM salary_data
        WHERE is_indexable = TRUE
    `);

    const totalSalaryPages = parseInt(result[0].count, 10);
    const staticAndCategoryCount = 3 + 823 + 393;
    const totalPages = totalSalaryPages + staticAndCategoryCount;

    const numSitemaps = Math.ceil(totalPages / URLS_PER_SITEMAP);

    return Array.from({ length: numSitemaps }, (_, i) => ({ id: i }));
}
