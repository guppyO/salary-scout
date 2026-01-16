import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    Header,
    Footer,
    SalaryCard,
    SalaryLinkCard,
    BreadcrumbJsonLd,
    SalaryJsonLd,
    FAQJsonLd,
} from '@/components';
import { query, queryOne, SalaryPageData } from '@/lib/db';
import {
    generateSalaryMetadata,
    generateBreadcrumbs,
    generateSalaryFAQs,
    formatSalary,
} from '@/lib/seo';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revenue-explorer-new.vercel.app';

interface PageProps {
    params: Promise<{ occupation: string; location: string }>;
}

async function getSalaryData(occSlug: string, metroSlug: string): Promise<SalaryPageData | null> {
    return queryOne<SalaryPageData>(`
        SELECT
            sd.*,
            o.occ_title,
            o.slug as occ_slug,
            o.occ_code,
            m.area_title,
            m.slug as metro_slug,
            m.state_abbr
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE o.slug = $1 AND m.slug = $2
    `, [occSlug, metroSlug]);
}

async function getRelatedOccupations(metroId: number, currentOccId: number) {
    return query<{
        occ_title: string;
        occ_slug: string;
        area_title: string;
        metro_slug: string;
        a_median: number;
        tot_emp: number;
    }>(`
        SELECT
            o.occ_title,
            o.slug as occ_slug,
            m.area_title,
            m.slug as metro_slug,
            sd.a_median,
            sd.tot_emp
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.metro_id = $1
          AND sd.occupation_id != $2
          AND sd.is_indexable = TRUE
        ORDER BY sd.a_median DESC NULLS LAST
        LIMIT 6
    `, [metroId, currentOccId]);
}

async function getOtherLocations(occupationId: number, currentMetroId: number) {
    return query<{
        occ_title: string;
        occ_slug: string;
        area_title: string;
        metro_slug: string;
        a_median: number;
        tot_emp: number;
    }>(`
        SELECT
            o.occ_title,
            o.slug as occ_slug,
            m.area_title,
            m.slug as metro_slug,
            sd.a_median,
            sd.tot_emp
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.occupation_id = $1
          AND sd.metro_id != $2
          AND sd.is_indexable = TRUE
        ORDER BY sd.a_median DESC NULLS LAST
        LIMIT 6
    `, [occupationId, currentMetroId]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { occupation, location } = await params;
    const data = await getSalaryData(occupation, location);

    if (!data) {
        return { title: 'Salary Data Not Found' };
    }

    return generateSalaryMetadata({
        occupation: data.occ_title,
        location: data.area_title,
        median: data.a_median,
        pct10: data.a_pct10,
        pct90: data.a_pct90,
        occSlug: data.occ_slug,
        metroSlug: data.metro_slug,
    });
}

export default async function SalaryPage({ params }: PageProps) {
    const { occupation, location } = await params;
    const data = await getSalaryData(occupation, location);

    if (!data) {
        notFound();
    }

    const [relatedOccupations, otherLocations] = await Promise.all([
        getRelatedOccupations(data.metro_id, data.occupation_id),
        getOtherLocations(data.occupation_id, data.metro_id),
    ]);

    const breadcrumbs = generateBreadcrumbs('salary', {
        occupation: { title: data.occ_title, slug: data.occ_slug },
        location: { title: data.area_title, slug: data.metro_slug },
    });

    const faqs = generateSalaryFAQs({
        occupation: data.occ_title,
        location: data.area_title,
        median: data.a_median,
        pct10: data.a_pct10,
        pct90: data.a_pct90,
        employment: data.tot_emp,
    });

    return (
        <div className="min-h-screen flex flex-col">
            {/* Structured Data */}
            <BreadcrumbJsonLd items={breadcrumbs} />
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
                url={`${SITE_URL}/salary/${data.occ_slug}/${data.metro_slug}`}
            />
            {faqs.length > 0 && <FAQJsonLd questions={faqs} />}

            <Header />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {/* Breadcrumbs */}
                        <nav className="text-sm text-blue-100 mb-4">
                            <Link href="/" className="hover:text-white">Home</Link>
                            <span className="mx-2">/</span>
                            <Link href="/occupations" className="hover:text-white">Occupations</Link>
                            <span className="mx-2">/</span>
                            <Link href={`/occupations/${data.occ_slug}`} className="hover:text-white">
                                {data.occ_title}
                            </Link>
                            <span className="mx-2">/</span>
                            <span className="text-white">{data.area_title}</span>
                        </nav>

                        <h1 className="text-3xl md:text-4xl font-bold">
                            {data.occ_title} Salary in {data.area_title}
                        </h1>
                        {data.state_abbr && (
                            <p className="text-blue-100 mt-1">{data.state_abbr}</p>
                        )}
                    </div>
                </section>

                {/* Main Content */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Main Salary Card */}
                            <div className="lg:col-span-2">
                                <SalaryCard
                                    occupation={data.occ_title}
                                    location={data.area_title}
                                    median={data.a_median}
                                    mean={data.a_mean}
                                    pct10={data.a_pct10}
                                    pct25={data.a_pct25}
                                    pct75={data.a_pct75}
                                    pct90={data.a_pct90}
                                    hourlyMean={data.h_mean}
                                    employment={data.tot_emp}
                                />

                                {/* FAQ Section */}
                                {faqs.length > 0 && (
                                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border p-6">
                                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                                            Frequently Asked Questions
                                        </h2>
                                        <div className="space-y-4">
                                            {faqs.map((faq, index) => (
                                                <div key={index}>
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {faq.question}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                                        {faq.answer}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Other Locations */}
                                {otherLocations.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                                            {data.occ_title} in Other Cities
                                        </h2>
                                        <div className="space-y-2">
                                            {otherLocations.map((item) => (
                                                <Link
                                                    key={`${item.occ_slug}-${item.metro_slug}`}
                                                    href={`/salary/${item.occ_slug}/${item.metro_slug}`}
                                                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                        {item.area_title}
                                                    </span>
                                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                                                        {formatSalary(item.a_median)}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                        <Link
                                            href={`/occupations/${data.occ_slug}`}
                                            className="block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View all locations &rarr;
                                        </Link>
                                    </div>
                                )}

                                {/* Related Occupations */}
                                {relatedOccupations.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
                                        <h2 className="font-bold text-gray-900 dark:text-white mb-4">
                                            Other Jobs in {data.area_title}
                                        </h2>
                                        <div className="space-y-2">
                                            {relatedOccupations.map((item) => (
                                                <Link
                                                    key={`${item.occ_slug}-${item.metro_slug}`}
                                                    href={`/salary/${item.occ_slug}/${item.metro_slug}`}
                                                    className="flex justify-between items-center p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                                                >
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                                                        {item.occ_title}
                                                    </span>
                                                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                                                        {formatSalary(item.a_median)}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                        <Link
                                            href={`/locations/${data.metro_slug}`}
                                            className="block mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View all occupations &rarr;
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Data Source Attribution */}
                <section className="py-8 px-4 bg-gray-50 dark:bg-gray-900">
                    <div className="container mx-auto max-w-6xl">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Salary data from the U.S. Bureau of Labor Statistics
                            Occupational Employment and Wage Statistics (OEWS) program, May 2024.
                            <a
                                href="https://www.bls.gov/oes/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                            >
                                Learn more
                            </a>
                        </p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

// Skip static generation at build time - all pages generated via ISR on first request
// This avoids connection exhaustion during builds with 138K+ salary pages
export async function generateStaticParams() {
    // Return empty array to skip prerendering
    // Pages will be generated on-demand and cached
    return [];
}

// Allow dynamic params (pages not in generateStaticParams)
export const dynamicParams = true;
