import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer, SearchBar } from '@/components';
import { query } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Browse All Occupations',
    description: 'Explore salary data for 800+ occupations. Find median salaries, wage ranges, and employment statistics by job title.',
};

export const revalidate = 86400; // Daily

interface OccupationWithStats {
    id: number;
    occ_code: string;
    occ_title: string;
    slug: string;
    avg_median: number | null;
    metro_count: number;
}

async function getOccupations(): Promise<OccupationWithStats[]> {
    return query<OccupationWithStats>(`
        SELECT
            o.id,
            o.occ_code,
            o.occ_title,
            o.slug,
            ROUND(AVG(sd.a_median)::numeric, 0) as avg_median,
            COUNT(DISTINCT sd.metro_id) as metro_count
        FROM occupations o
        LEFT JOIN salary_data sd ON o.id = sd.occupation_id AND sd.is_indexable = TRUE
        GROUP BY o.id, o.occ_code, o.occ_title, o.slug
        HAVING COUNT(DISTINCT sd.metro_id) > 0
        ORDER BY o.occ_title ASC
    `);
}

// Group occupations by first letter
function groupByLetter(occupations: OccupationWithStats[]): Map<string, OccupationWithStats[]> {
    const groups = new Map<string, OccupationWithStats[]>();
    for (const occ of occupations) {
        const letter = occ.occ_title.charAt(0).toUpperCase();
        if (!groups.has(letter)) {
            groups.set(letter, []);
        }
        groups.get(letter)!.push(occ);
    }
    return groups;
}

export default async function OccupationsPage() {
    const occupations = await getOccupations();
    const grouped = groupByLetter(occupations);
    const letters = Array.from(grouped.keys()).sort();

    // Calculate summary stats
    const totalOccupations = occupations.length;
    const occupationsWithSalary = occupations.filter(o => o.avg_median);
    const avgSalary = occupationsWithSalary.length > 0
        ? Math.round(occupationsWithSalary.reduce((sum, o) => sum + (o.avg_median || 0), 0) / occupationsWithSalary.length)
        : 0;
    const topPaying = [...occupations].sort((a, b) => (b.avg_median || 0) - (a.avg_median || 0))[0];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-16 px-4 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto max-w-6xl relative">
                        {/* Breadcrumb */}
                        <nav className="text-sm text-blue-200 mb-6">
                            <Link href="/" className="hover:text-white underline">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white">Occupations</span>
                        </nav>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Browse All Occupations
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                            Explore salary data for {totalOccupations.toLocaleString()} occupations across the United States
                        </p>

                        {/* Search */}
                        <div className="max-w-2xl">
                            <SearchBar placeholder="Search for an occupation..." size="lg" />
                        </div>
                    </div>
                </section>

                {/* Alphabet Navigation */}
                <section className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="container mx-auto max-w-6xl px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                            {letters.map((letter) => (
                                <a
                                    key={letter}
                                    href={`#${letter}`}
                                    className="w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    {letter}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Occupations List */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {letters.map((letter) => (
                            <div key={letter} id={letter} className="mb-12 scroll-mt-32">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white text-2xl font-bold rounded-xl shadow-lg shadow-blue-600/20">
                                        {letter}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {letter}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {grouped.get(letter)!.length} occupations
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {grouped.get(letter)!.map((occ) => (
                                        <Link
                                            key={occ.id}
                                            href={`/occupations/${occ.slug}`}
                                            className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {occ.occ_title}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    {occ.avg_median && (
                                                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                            ${parseInt(String(occ.avg_median)).toLocaleString()}
                                                        </span>
                                                    )}
                                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                                    <span>{occ.metro_count} locations</span>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
