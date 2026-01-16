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

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Browse All Occupations
                        </h1>
                        <p className="text-xl text-blue-100 mb-6">
                            Explore salary data for {occupations.length.toLocaleString()} occupations
                        </p>
                        <div className="max-w-xl">
                            <SearchBar placeholder="Search occupations..." />
                        </div>
                    </div>
                </section>

                {/* Alphabet Navigation */}
                <section className="sticky top-16 z-40 bg-white dark:bg-gray-950 border-b py-3 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-wrap gap-2">
                            {letters.map((letter) => (
                                <a
                                    key={letter}
                                    href={`#${letter}`}
                                    className="w-8 h-8 flex items-center justify-center text-sm font-medium rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300"
                                >
                                    {letter}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Occupations List */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {letters.map((letter) => (
                            <div key={letter} id={letter} className="mb-8 scroll-mt-32">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b">
                                    {letter}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {grouped.get(letter)!.map((occ) => (
                                        <Link
                                            key={occ.id}
                                            href={`/occupations/${occ.slug}`}
                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                        >
                                            <span className="text-gray-900 dark:text-white font-medium truncate mr-2">
                                                {occ.occ_title}
                                            </span>
                                            {occ.avg_median && (
                                                <span className="text-blue-600 dark:text-blue-400 font-semibold shrink-0">
                                                    ${parseInt(String(occ.avg_median)).toLocaleString()}
                                                </span>
                                            )}
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
