/**
 * Robots.txt for SalaryScout
 *
 * Allows all crawlers, points to sitemap, blocks utility pages
 */

import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salaryscout.dev';

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
        sitemap: [
            `${SITE_URL}/sitemap.xml`, // Sitemap index
            `${SITE_URL}/sitemap/0.xml`,
            `${SITE_URL}/sitemap/1.xml`,
            `${SITE_URL}/sitemap/2.xml`,
            `${SITE_URL}/sitemap/3.xml`,
            `${SITE_URL}/sitemap/4.xml`,
            `${SITE_URL}/sitemap/5.xml`,
            `${SITE_URL}/sitemap/6.xml`,
            `${SITE_URL}/sitemap/7.xml`,
            `${SITE_URL}/sitemap/8.xml`,
            `${SITE_URL}/sitemap/9.xml`,
            `${SITE_URL}/sitemap/10.xml`,
            `${SITE_URL}/sitemap/11.xml`,
            `${SITE_URL}/sitemap/12.xml`,
            `${SITE_URL}/sitemap/13.xml`,
        ],
    };
}
