/**
 * Sitemap Index API Route
 *
 * Generates a sitemap index file that references all child sitemaps.
 * This helps search engines discover all sitemap files.
 *
 * Accessed via /sitemap.xml through next.config.ts rewrite
 */

import { query } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salaryscout.dev';
const URLS_PER_SITEMAP = 10000;

export async function GET(): Promise<Response> {
    // Calculate number of sitemaps needed
    const result = await query<{ count: string }>(`
        SELECT COUNT(*) as count
        FROM salary_data
        WHERE is_indexable = TRUE
    `);

    const totalSalaryPages = parseInt(result[0].count, 10);
    const staticAndCategoryCount = 3 + 823 + 393; // static + occupations + metros
    const totalPages = totalSalaryPages + staticAndCategoryCount;
    const numSitemaps = Math.ceil(totalPages / URLS_PER_SITEMAP);

    const lastMod = new Date().toISOString();

    // Generate sitemap index XML
    const sitemapEntries = Array.from({ length: numSitemaps }, (_, i) => `
  <sitemap>
    <loc>${SITE_URL}/sitemap/${i}.xml</loc>
    <lastmod>${lastMod}</lastmod>
  </sitemap>`).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemapEntries}
</sitemapindex>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
    });
}
