/**
 * JSON-LD Structured Data Components for SalaryScout
 *
 * Schema.org markup for enhanced search results and rich snippets
 */

import { SalaryPageData } from '@/lib/db';

interface WebsiteJsonLdProps {
    url: string;
    name: string;
    description: string;
}

/**
 * Website-level structured data (for homepage)
 */
export function WebsiteJsonLd({ url, name, description }: WebsiteJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        description,
        url,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/search?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface SalaryJsonLdProps {
    occupation: string;
    occupationCode: string;
    location: string;
    stateAbbr: string | null;
    median: number;
    mean: number | null;
    pct10: number | null;
    pct25: number | null;
    pct75: number | null;
    pct90: number | null;
    employment: number | null;
    url: string;
}

/**
 * Salary page structured data
 * Uses OccupationalExperienceRequirements + MonetaryAmountDistribution
 */
export function SalaryJsonLd({
    occupation,
    occupationCode,
    location,
    stateAbbr,
    median,
    mean,
    pct10,
    pct25,
    pct75,
    pct90,
    employment,
    url,
}: SalaryJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Occupation',
        name: occupation,
        occupationalCategory: occupationCode,
        estimatedSalary: {
            '@type': 'MonetaryAmountDistribution',
            name: `${occupation} salary in ${location}`,
            currency: 'USD',
            duration: 'P1Y',
            median: median,
            ...(mean && { mean }),
            ...(pct10 && { percentile10: pct10 }),
            ...(pct25 && { percentile25: pct25 }),
            ...(pct75 && { percentile75: pct75 }),
            ...(pct90 && { percentile90: pct90 }),
        },
        occupationLocation: {
            '@type': 'City',
            name: location,
            ...(stateAbbr && {
                containedInPlace: {
                    '@type': 'State',
                    name: stateAbbr,
                },
            }),
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url,
        },
        ...(employment && {
            description: `There are approximately ${employment.toLocaleString()} ${occupation} jobs in ${location}.`,
        }),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface BreadcrumbJsonLdProps {
    items: Array<{
        name: string;
        url: string;
    }>;
}

/**
 * Breadcrumb structured data
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface FAQJsonLdProps {
    questions: Array<{
        question: string;
        answer: string;
    }>;
}

/**
 * FAQ structured data (for pages with FAQ sections)
 */
export function FAQJsonLd({ questions }: FAQJsonLdProps) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map(q => ({
            '@type': 'Question',
            name: q.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: q.answer,
            },
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

/**
 * Helper to create salary page JSON-LD from database row
 */
export function createSalaryJsonLdFromData(
    data: SalaryPageData,
    siteUrl: string
): React.ReactElement {
    return (
        <SalaryJsonLd
            occupation={data.occ_title}
            occupationCode={data.occ_code}
            location={data.area_title}
            stateAbbr={data.state_abbr}
            median={data.a_median || 0}
            mean={data.a_mean}
            pct10={data.a_pct10}
            pct25={data.a_pct25}
            pct75={data.a_pct75}
            pct90={data.a_pct90}
            employment={data.tot_emp}
            url={`${siteUrl}/salary/${data.occ_slug}/${data.metro_slug}`}
        />
    );
}
