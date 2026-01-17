import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer, BreadcrumbJsonLd } from '@/components';
import { query, queryOne } from '@/lib/db';
import { generateOccupationMetadata, formatSalary, generateBreadcrumbs } from '@/lib/seo';

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface OccupationData {
    id: number;
    occ_code: string;
    occ_title: string;
    slug: string;
}

interface SalaryByMetro {
    metro_id: number;
    area_title: string;
    metro_slug: string;
    state_abbr: string | null;
    a_median: number | null;
    a_mean: number | null;
    tot_emp: number | null;
}

async function getOccupation(slug: string): Promise<OccupationData | null> {
    return queryOne<OccupationData>(`
        SELECT id, occ_code, occ_title, slug
        FROM occupations
        WHERE slug = $1
    `, [slug]);
}

async function getSalariesByMetro(occupationId: number): Promise<SalaryByMetro[]> {
    return query<SalaryByMetro>(`
        SELECT
            m.id as metro_id,
            m.area_title,
            m.slug as metro_slug,
            m.state_abbr,
            sd.a_median,
            sd.a_mean,
            sd.tot_emp
        FROM salary_data sd
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.occupation_id = $1 AND sd.is_indexable = TRUE
        ORDER BY sd.a_median DESC NULLS LAST
    `, [occupationId]);
}

async function getNationalStats(occupationId: number) {
    return queryOne<{
        avg_median: number;
        min_median: number;
        max_median: number;
        total_emp: number;
        metro_count: number;
    }>(`
        SELECT
            ROUND(AVG(a_median)::numeric, 0) as avg_median,
            MIN(a_median) as min_median,
            MAX(a_median) as max_median,
            SUM(tot_emp) as total_emp,
            COUNT(*) as metro_count
        FROM salary_data
        WHERE occupation_id = $1 AND is_indexable = TRUE AND a_median IS NOT NULL
    `, [occupationId]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const occupation = await getOccupation(slug);

    if (!occupation) {
        return { title: 'Occupation Not Found' };
    }

    const stats = await getNationalStats(occupation.id);

    return generateOccupationMetadata({
        occupation: occupation.occ_title,
        slug: occupation.slug,
        nationalMedian: stats?.avg_median,
        metroCount: stats?.metro_count,
    });
}

export default async function OccupationPage({ params }: PageProps) {
    const { slug } = await params;
    const occupation = await getOccupation(slug);

    if (!occupation) {
        notFound();
    }

    const [salaries, stats] = await Promise.all([
        getSalariesByMetro(occupation.id),
        getNationalStats(occupation.id),
    ]);

    const breadcrumbs = generateBreadcrumbs('occupation', {
        occupation: { title: occupation.occ_title, slug: occupation.slug },
    });

    return (
        <div className="min-h-screen flex flex-col">
            <BreadcrumbJsonLd items={breadcrumbs} />
            <Header />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {/* Breadcrumbs */}
                        <nav className="text-sm text-blue-100 mb-4" aria-label="Breadcrumb">
                            <Link href="/" className="underline hover:text-white">Home</Link>
                            <span className="mx-2">/</span>
                            <Link href="/occupations" className="underline hover:text-white">Occupations</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white" aria-current="page">{occupation.occ_title}</span>
                        </nav>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {occupation.occ_title} Salary
                        </h1>

                        {stats && (
                            <div className="flex flex-wrap gap-6 text-blue-100">
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {formatSalary(stats.avg_median)}
                                    </span>
                                    <span className="block text-sm">National Average</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {formatSalary(stats.min_median)} - {formatSalary(stats.max_median)}
                                    </span>
                                    <span className="block text-sm">Salary Range</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {stats.metro_count?.toLocaleString()}
                                    </span>
                                    <span className="block text-sm">Metro Areas</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Salaries Table */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {occupation.occ_title} Salaries by Location
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                                            Location
                                        </th>
                                        <th className="text-right p-4 font-semibold text-gray-900 dark:text-white">
                                            Median Salary
                                        </th>
                                        <th className="text-right p-4 font-semibold text-gray-900 dark:text-white hidden md:table-cell">
                                            Mean Salary
                                        </th>
                                        <th className="text-right p-4 font-semibold text-gray-900 dark:text-white hidden md:table-cell">
                                            Employment
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {salaries.map((salary) => (
                                        <tr
                                            key={salary.metro_id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="p-4">
                                                <Link
                                                    href={`/salary/${occupation.slug}/${salary.metro_slug}`}
                                                    className="text-blue-600 dark:text-blue-400 underline font-medium"
                                                >
                                                    {salary.area_title}
                                                </Link>
                                                {salary.state_abbr && (
                                                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                                                        {salary.state_abbr}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right font-semibold text-gray-900 dark:text-white">
                                                {formatSalary(salary.a_median)}
                                            </td>
                                            <td className="p-4 text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                                {formatSalary(salary.a_mean)}
                                            </td>
                                            <td className="p-4 text-right text-gray-600 dark:text-gray-400 hidden md:table-cell">
                                                {salary.tot_emp?.toLocaleString() || 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {salaries.length === 0 && (
                            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                No salary data available for this occupation.
                            </p>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

// Skip static generation at build - pages generated via ISR on first request
export async function generateStaticParams() {
    return [];
}

export const dynamicParams = true;
