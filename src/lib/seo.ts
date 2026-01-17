/**
 * SEO Utilities for SalaryScout
 *
 * Centralized metadata generation for programmatic pages
 */

import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salaryscout.dev';
const SITE_NAME = 'SalaryScout';

/**
 * Format currency for display
 */
export function formatSalary(amount: number | null): string {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number | null): string {
    if (!num) return 'N/A';
    return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Generate metadata for salary pages (the money pages)
 */
export function generateSalaryMetadata({
    occupation,
    location,
    median,
    pct10,
    pct90,
    occSlug,
    metroSlug,
}: {
    occupation: string;
    location: string;
    median: number | null;
    pct10: number | null;
    pct90: number | null;
    occSlug: string;
    metroSlug: string;
}): Metadata {
    const medianStr = formatSalary(median);
    const lowStr = formatSalary(pct10);
    const highStr = formatSalary(pct90);

    const title = `${occupation} Salary in ${location} 2024`;
    const description = median
        ? `The median ${occupation} salary in ${location} is ${medianStr}. Salary range: ${lowStr} to ${highStr}. See detailed wage data and employment statistics.`
        : `${occupation} salary data in ${location}. See wage statistics, employment data, and compare with other locations.`;

    const url = `${SITE_URL}/salary/${occSlug}/${metroSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            type: 'article',
        },
        twitter: {
            card: 'summary',
            title,
            description,
        },
    };
}

/**
 * Generate metadata for occupation pages
 */
export function generateOccupationMetadata({
    occupation,
    slug,
    nationalMedian,
    metroCount,
}: {
    occupation: string;
    slug: string;
    nationalMedian?: number | null;
    metroCount?: number;
}): Metadata {
    const medianStr = nationalMedian ? formatSalary(nationalMedian) : 'varies by location';

    const title = `${occupation} Salary - National Average & Top Cities`;
    const description = `${occupation} salaries across the US. National median: ${medianStr}. Compare salaries in ${metroCount || 390}+ metro areas.`;

    const url = `${SITE_URL}/occupations/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            type: 'article',
        },
    };
}

/**
 * Generate metadata for location pages
 */
export function generateLocationMetadata({
    location,
    slug,
    occupationCount,
    topOccupation,
    topSalary,
}: {
    location: string;
    slug: string;
    occupationCount?: number;
    topOccupation?: string;
    topSalary?: number | null;
}): Metadata {
    const title = `Salaries in ${location} - Top Jobs & Pay`;

    let description = `Explore salary data for ${occupationCount || 800}+ occupations in ${location}.`;
    if (topOccupation && topSalary) {
        description += ` Top paying job: ${topOccupation} at ${formatSalary(topSalary)}.`;
    }

    const url = `${SITE_URL}/locations/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            type: 'article',
        },
    };
}

/**
 * Generate breadcrumb items for JSON-LD
 */
export function generateBreadcrumbs(
    type: 'salary' | 'occupation' | 'location',
    data: {
        occupation?: { title: string; slug: string };
        location?: { title: string; slug: string };
    }
): Array<{ name: string; url: string }> {
    const breadcrumbs = [{ name: 'Home', url: SITE_URL }];

    if (type === 'salary' && data.occupation && data.location) {
        breadcrumbs.push(
            { name: 'Occupations', url: `${SITE_URL}/occupations` },
            { name: data.occupation.title, url: `${SITE_URL}/occupations/${data.occupation.slug}` },
            { name: data.location.title, url: `${SITE_URL}/salary/${data.occupation.slug}/${data.location.slug}` }
        );
    } else if (type === 'occupation' && data.occupation) {
        breadcrumbs.push(
            { name: 'Occupations', url: `${SITE_URL}/occupations` },
            { name: data.occupation.title, url: `${SITE_URL}/occupations/${data.occupation.slug}` }
        );
    } else if (type === 'location' && data.location) {
        breadcrumbs.push(
            { name: 'Locations', url: `${SITE_URL}/locations` },
            { name: data.location.title, url: `${SITE_URL}/locations/${data.location.slug}` }
        );
    }

    return breadcrumbs;
}

/**
 * Generate FAQ content for salary pages
 */
export function generateSalaryFAQs({
    occupation,
    location,
    median,
    pct10,
    pct90,
    employment,
}: {
    occupation: string;
    location: string;
    median: number | null;
    pct10: number | null;
    pct90: number | null;
    employment: number | null;
}): Array<{ question: string; answer: string }> {
    const faqs = [];

    if (median) {
        faqs.push({
            question: `What is the average ${occupation} salary in ${location}?`,
            answer: `The median annual salary for a ${occupation} in ${location} is ${formatSalary(median)} according to the latest BLS data.`,
        });
    }

    if (pct10 && pct90) {
        faqs.push({
            question: `What is the salary range for ${occupation}s in ${location}?`,
            answer: `${occupation} salaries in ${location} range from ${formatSalary(pct10)} (10th percentile) to ${formatSalary(pct90)} (90th percentile).`,
        });
    }

    if (employment) {
        faqs.push({
            question: `How many ${occupation} jobs are in ${location}?`,
            answer: `There are approximately ${formatNumber(employment)} ${occupation} positions in the ${location} metropolitan area.`,
        });
    }

    return faqs;
}
