/**
 * Robots.txt for SalaryScout
 *
 * Allows all crawlers, points to sitemap, blocks utility pages
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revenue-explorer-new.vercel.app';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',      // API routes
                    '/search',    // Search page (thin content)
                    '/_next/',    // Next.js internals
                    '/admin/',    // Future admin area
                ],
            },
            {
                userAgent: 'GPTBot',
                disallow: ['/'],  // Block AI training on our content
            },
            {
                userAgent: 'ChatGPT-User',
                disallow: ['/'],
            },
            {
                userAgent: 'CCBot',
                disallow: ['/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
