import { Metadata } from 'next';
import Link from 'next/link';
import { Header, Footer, SearchBar } from '@/components';
import { query } from '@/lib/db';

export const metadata: Metadata = {
    title: 'Browse Salaries by Location',
    description: 'Explore salary data across 390+ metro areas in the United States. Find salary information by city and state.',
};

export const revalidate = 86400; // Daily

interface MetroWithStats {
    id: number;
    area_code: string;
    area_title: string;
    slug: string;
    state_abbr: string | null;
    occ_count: number;
    top_salary: number | null;
}

async function getMetros(): Promise<MetroWithStats[]> {
    return query<MetroWithStats>(`
        SELECT
            m.id,
            m.area_code,
            m.area_title,
            m.slug,
            m.state_abbr,
            COUNT(DISTINCT sd.occupation_id) as occ_count,
            MAX(sd.a_median) as top_salary
        FROM metros m
        LEFT JOIN salary_data sd ON m.id = sd.metro_id AND sd.is_indexable = TRUE
        GROUP BY m.id, m.area_code, m.area_title, m.slug, m.state_abbr
        HAVING COUNT(DISTINCT sd.occupation_id) > 0
        ORDER BY m.state_abbr, m.area_title
    `);
}

// Group metros by state
function groupByState(metros: MetroWithStats[]): Map<string, MetroWithStats[]> {
    const groups = new Map<string, MetroWithStats[]>();
    for (const metro of metros) {
        const state = metro.state_abbr || 'Other';
        if (!groups.has(state)) {
            groups.set(state, []);
        }
        groups.get(state)!.push(metro);
    }
    return groups;
}

export default async function LocationsPage() {
    const metros = await getMetros();
    const grouped = groupByState(metros);
    const states = Array.from(grouped.keys()).sort();

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-b from-blue-600 to-blue-700 text-white py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Browse Salaries by Location
                        </h1>
                        <p className="text-xl text-blue-100 mb-6">
                            Explore salary data across {metros.length.toLocaleString()} metro areas
                        </p>
                        <div className="max-w-xl">
                            <SearchBar placeholder="Search locations..." />
                        </div>
                    </div>
                </section>

                {/* State Navigation */}
                <section className="sticky top-16 z-40 bg-white dark:bg-gray-950 border-b py-3 px-4">
                    <div className="container mx-auto max-w-6xl">
                        <div className="flex flex-wrap gap-2">
                            {states.map((state) => (
                                <a
                                    key={state}
                                    href={`#${state}`}
                                    className="px-3 py-1 text-sm font-medium rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-700 dark:text-gray-300"
                                >
                                    {state}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Metros List */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {states.map((state) => (
                            <div key={state} id={state} className="mb-8 scroll-mt-32">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 pb-2 border-b">
                                    {state}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {grouped.get(state)!.map((metro) => (
                                        <Link
                                            key={metro.id}
                                            href={`/locations/${metro.slug}`}
                                            className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                                        >
                                            <span className="text-gray-900 dark:text-white font-medium truncate mr-2">
                                                {metro.area_title}
                                            </span>
                                            <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">
                                                {metro.occ_count} jobs
                                            </span>
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
