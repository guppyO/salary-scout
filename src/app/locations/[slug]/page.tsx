import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Header, Footer, BreadcrumbJsonLd } from '@/components';
import { query, queryOne } from '@/lib/db';
import { generateLocationMetadata, formatSalary, generateBreadcrumbs } from '@/lib/seo';

interface PageProps {
    params: Promise<{ slug: string }>;
}

interface MetroData {
    id: number;
    area_code: string;
    area_title: string;
    slug: string;
    state_abbr: string | null;
}

interface SalaryByOccupation {
    occupation_id: number;
    occ_title: string;
    occ_slug: string;
    a_median: number | null;
    a_mean: number | null;
    tot_emp: number | null;
}

async function getMetro(slug: string): Promise<MetroData | null> {
    return queryOne<MetroData>(`
        SELECT id, area_code, area_title, slug, state_abbr
        FROM metros
        WHERE slug = $1
    `, [slug]);
}

async function getSalariesByOccupation(metroId: number): Promise<SalaryByOccupation[]> {
    return query<SalaryByOccupation>(`
        SELECT
            o.id as occupation_id,
            o.occ_title,
            o.slug as occ_slug,
            sd.a_median,
            sd.a_mean,
            sd.tot_emp
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        WHERE sd.metro_id = $1 AND sd.is_indexable = TRUE
        ORDER BY sd.a_median DESC NULLS LAST
    `, [metroId]);
}

async function getMetroStats(metroId: number) {
    return queryOne<{
        avg_median: number;
        top_salary: number;
        occ_count: number;
        total_emp: number;
        top_occupation: string;
    }>(`
        SELECT
            ROUND(AVG(sd.a_median)::numeric, 0) as avg_median,
            MAX(sd.a_median) as top_salary,
            COUNT(DISTINCT sd.occupation_id) as occ_count,
            SUM(sd.tot_emp) as total_emp,
            (SELECT o.occ_title FROM salary_data sd2
             JOIN occupations o ON sd2.occupation_id = o.id
             WHERE sd2.metro_id = $1 AND sd2.is_indexable = TRUE
             ORDER BY sd2.a_median DESC NULLS LAST LIMIT 1) as top_occupation
        FROM salary_data sd
        WHERE sd.metro_id = $1 AND sd.is_indexable = TRUE AND sd.a_median IS NOT NULL
    `, [metroId]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const metro = await getMetro(slug);

    if (!metro) {
        return { title: 'Location Not Found' };
    }

    const stats = await getMetroStats(metro.id);

    return generateLocationMetadata({
        location: metro.area_title,
        slug: metro.slug,
        occupationCount: stats?.occ_count,
        topOccupation: stats?.top_occupation,
        topSalary: stats?.top_salary,
    });
}

export default async function LocationPage({ params }: PageProps) {
    const { slug } = await params;
    const metro = await getMetro(slug);

    if (!metro) {
        notFound();
    }

    const [salaries, stats] = await Promise.all([
        getSalariesByOccupation(metro.id),
        getMetroStats(metro.id),
    ]);

    const breadcrumbs = generateBreadcrumbs('location', {
        location: { title: metro.area_title, slug: metro.slug },
    });

    return (
        <div className="min-h-screen flex flex-col">
            <BreadcrumbJsonLd items={breadcrumbs} />
            <Header />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {/* Breadcrumbs */}
                        <nav className="text-sm text-blue-100 mb-4" aria-label="Breadcrumb">
                            <Link href="/" className="underline hover:text-white">Home</Link>
                            <span className="mx-2">/</span>
                            <Link href="/locations" className="underline hover:text-white">Locations</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white" aria-current="page">{metro.area_title}</span>
                        </nav>

                        <h1 className="text-3xl md:text-4xl font-bold mb-2">
                            Salaries in {metro.area_title}
                        </h1>
                        {metro.state_abbr && (
                            <p className="text-xl text-blue-100 mb-4">{metro.state_abbr}</p>
                        )}

                        {stats && (
                            <div className="flex flex-wrap gap-6 text-blue-100 mt-4">
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {formatSalary(stats.avg_median)}
                                    </span>
                                    <span className="block text-sm">Average Salary</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {stats.occ_count?.toLocaleString()}
                                    </span>
                                    <span className="block text-sm">Occupations</span>
                                </div>
                                <div>
                                    <span className="text-2xl font-bold text-white">
                                        {stats.total_emp?.toLocaleString() || 'N/A'}
                                    </span>
                                    <span className="block text-sm">Total Jobs</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Salaries Table */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Salaries by Occupation in {metro.area_title}
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800">
                                        <th className="text-left p-4 font-semibold text-gray-900 dark:text-white">
                                            Occupation
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
                                            key={salary.occupation_id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="p-4">
                                                <Link
                                                    href={`/salary/${salary.occ_slug}/${metro.slug}`}
                                                    className="text-blue-600 dark:text-blue-400 underline font-medium"
                                                >
                                                    {salary.occ_title}
                                                </Link>
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
                                No salary data available for this location.
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
