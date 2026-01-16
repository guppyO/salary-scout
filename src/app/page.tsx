import Link from 'next/link';
import { Header, Footer, HeroSearch, StatCard, Icons, WebsiteJsonLd } from '@/components';
import { query } from '@/lib/db';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://salaryscout.com';

// Revalidate every day
export const revalidate = 86400;

async function getStats() {
    const result = await query<{
        occupations: string;
        metros: string;
        salary_pages: string;
    }>(`
        SELECT
            (SELECT COUNT(*) FROM occupations) as occupations,
            (SELECT COUNT(*) FROM metros) as metros,
            (SELECT COUNT(*) FROM salary_data WHERE is_indexable = TRUE) as salary_pages
    `);
    return result[0];
}

async function getTopOccupations() {
    return query<{
        occ_title: string;
        slug: string;
        avg_median: number;
        metro_count: number;
    }>(`
        SELECT
            o.occ_title,
            o.slug,
            ROUND(AVG(sd.a_median)::numeric, 0) as avg_median,
            COUNT(DISTINCT sd.metro_id) as metro_count
        FROM occupations o
        JOIN salary_data sd ON o.id = sd.occupation_id
        WHERE sd.is_indexable = TRUE AND sd.a_median IS NOT NULL
        GROUP BY o.id, o.occ_title, o.slug
        ORDER BY avg_median DESC
        LIMIT 8
    `);
}

async function getTopMetros() {
    return query<{
        area_title: string;
        slug: string;
        state_abbr: string;
        occ_count: number;
    }>(`
        SELECT
            m.area_title,
            m.slug,
            m.state_abbr,
            COUNT(DISTINCT sd.occupation_id) as occ_count
        FROM metros m
        JOIN salary_data sd ON m.id = sd.metro_id
        WHERE sd.is_indexable = TRUE
        GROUP BY m.id, m.area_title, m.slug, m.state_abbr
        ORDER BY occ_count DESC
        LIMIT 8
    `);
}

export default async function HomePage() {
    const [stats, topOccupations, topMetros] = await Promise.all([
        getStats(),
        getTopOccupations(),
        getTopMetros(),
    ]);

    return (
        <>
            <WebsiteJsonLd
                url={SITE_URL}
                name="SalaryScout"
                description="Explore salary data for 800+ occupations across 390+ metro areas. Find median salaries, wage ranges, and employment statistics."
            />

            <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
                <Header />

                <main className="flex-1">
                    {/* Hero Section */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-24 px-4">
                        {/* Background decoration */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl" />
                        </div>

                        <div className="relative container mx-auto max-w-4xl text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-blue-100 mb-6">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Powered by Official BLS Data
                            </div>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                                Salary Data by{' '}
                                <span className="bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                                    Job & Location
                                </span>
                            </h1>
                            <p className="text-xl text-blue-100/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                                Explore salary data for {parseInt(stats.occupations).toLocaleString()}+ occupations
                                across {parseInt(stats.metros).toLocaleString()}+ metro areas.
                            </p>

                            {/* Search */}
                            <div className="max-w-3xl mx-auto">
                                <HeroSearch />
                            </div>

                            {/* Quick stats under search */}
                            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm">
                                <div className="flex items-center gap-2 text-blue-100/80">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Free to use</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-100/80">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Updated annually</span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-100/80">
                                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>{`${Math.round(parseInt(stats.salary_pages) / 1000)}K+`} data points</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stats Section */}
                    <section className="py-16 px-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="container mx-auto max-w-6xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    value={parseInt(stats.occupations).toLocaleString()}
                                    label="Occupations"
                                    icon={<Icons.Briefcase />}
                                />
                                <StatCard
                                    value={parseInt(stats.metros).toLocaleString()}
                                    label="Metro Areas"
                                    icon={<Icons.MapPin />}
                                />
                                <StatCard
                                    value={`${Math.round(parseInt(stats.salary_pages) / 1000)}K+`}
                                    label="Salary Data Points"
                                    icon={<Icons.ChartBar />}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Top Occupations Section */}
                    <section className="py-20 px-4">
                        <div className="container mx-auto max-w-6xl">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Top Paying Occupations
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Highest earning jobs based on median salary
                                    </p>
                                </div>
                                <Link
                                    href="/occupations"
                                    className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium group"
                                >
                                    View all
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {topOccupations.map((occ, index) => (
                                    <Link
                                        key={occ.slug}
                                        href={`/occupations/${occ.slug}`}
                                        className="group relative block p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        {/* Rank badge */}
                                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                                            {index + 1}
                                        </div>
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 group-hover:from-blue-50/50 dark:from-blue-900/0 dark:group-hover:from-blue-900/20 rounded-2xl transition-all duration-300" />
                                        <div className="relative">
                                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {occ.occ_title}
                                            </h3>
                                            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-1">
                                                ${parseInt(String(occ.avg_median)).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                avg. in {occ.metro_count} locations
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href="/occupations"
                                className="sm:hidden mt-6 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                            >
                                View all occupations
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </section>

                    {/* Top Metros Section */}
                    <section className="py-20 px-4 bg-gray-50/50 dark:bg-gray-900/50">
                        <div className="container mx-auto max-w-6xl">
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                        Popular Locations
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Metro areas with the most salary data
                                    </p>
                                </div>
                                <Link
                                    href="/locations"
                                    className="hidden sm:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium group"
                                >
                                    View all
                                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {topMetros.map((metro) => (
                                    <Link
                                        key={metro.slug}
                                        href={`/locations/${metro.slug}`}
                                        className="group relative block p-5 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/80 dark:border-gray-800 hover:shadow-xl hover:shadow-indigo-500/5 dark:hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 group-hover:from-indigo-50/50 dark:from-indigo-900/0 dark:group-hover:from-indigo-900/20 rounded-2xl transition-all duration-300" />
                                        <div className="relative">
                                            <div className="w-10 h-10 mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {metro.area_title}
                                            </h3>
                                            {metro.state_abbr && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                    {metro.state_abbr}
                                                </p>
                                            )}
                                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                {metro.occ_count} occupations
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <Link
                                href="/locations"
                                className="sm:hidden mt-6 flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
                            >
                                View all locations
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-24 px-4">
                        <div className="container mx-auto max-w-4xl">
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-10 md:p-16 text-center text-white">
                                {/* Background decoration */}
                                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                                    <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
                                    <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl" />
                                </div>

                                <div className="relative">
                                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                        Find Your Salary
                                    </h2>
                                    <p className="text-lg text-blue-100/90 mb-10 max-w-xl mx-auto">
                                        Search for any job title and location to see detailed salary data
                                        including median pay, salary ranges, and employment statistics.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Link
                                            href="/occupations"
                                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/30"
                                        >
                                            Browse Occupations
                                        </Link>
                                        <Link
                                            href="/locations"
                                            className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                                        >
                                            Browse Locations
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
}
