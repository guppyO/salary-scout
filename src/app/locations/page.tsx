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

// State name mapping
const stateNames: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
    'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
    'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
    'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
    'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
    'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
    'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
    'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
    'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
    'PR': 'Puerto Rico', 'GU': 'Guam', 'VI': 'Virgin Islands',
};

export default async function LocationsPage() {
    const metros = await getMetros();
    const grouped = groupByState(metros);
    const states = Array.from(grouped.keys()).sort();

    // Calculate summary stats
    const totalMetros = metros.length;
    const totalStates = states.length;
    const topPayingMetro = [...metros].sort((a, b) => (b.top_salary || 0) - (a.top_salary || 0))[0];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-16 px-4 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
                    </div>

                    <div className="container mx-auto max-w-6xl relative">
                        {/* Breadcrumb */}
                        <nav className="text-sm text-blue-200 mb-6">
                            <Link href="/" className="hover:text-white underline">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-white">Locations</span>
                        </nav>

                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Browse Salaries by Location
                        </h1>
                        <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                            Explore salary data across {totalMetros.toLocaleString()} metro areas in the United States
                        </p>

                        {/* Search */}
                        <div className="max-w-2xl">
                            <SearchBar placeholder="Search for a city or metro area..." size="lg" />
                        </div>
                    </div>
                </section>

                {/* State Navigation */}
                <section className="sticky top-16 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="container mx-auto max-w-6xl px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                            {states.map((state) => (
                                <a
                                    key={state}
                                    href={`#${state}`}
                                    className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-700 dark:text-gray-300 transition-colors"
                                >
                                    {state}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Metros List */}
                <section className="py-12 px-4">
                    <div className="container mx-auto max-w-6xl">
                        {states.map((state) => (
                            <div key={state} id={state} className="mb-12 scroll-mt-32">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-600/20">
                                        {state}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stateNames[state] || state}
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {grouped.get(state)!.length} metro {grouped.get(state)!.length === 1 ? 'area' : 'areas'}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {grouped.get(state)!.map((metro) => (
                                        <Link
                                            key={metro.id}
                                            href={`/locations/${metro.slug}`}
                                            className="group flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {metro.area_title}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                        {metro.occ_count} jobs
                                                    </span>
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
