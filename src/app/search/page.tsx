'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchResult {
    type: 'occupation' | 'location' | 'salary';
    title: string;
    subtitle?: string;
    href: string;
    salary?: string;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const initialQuery = searchParams.get('q') || searchParams.get('job') || '';
    const initialLocation = searchParams.get('location') || '';

    const [query, setQuery] = useState(initialQuery);
    const [location, setLocation] = useState(initialLocation);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function search() {
            if (!query.trim() && !location.trim()) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (query) params.set('q', query);
                if (location) params.set('location', location);

                const res = await fetch(`/api/search?${params.toString()}`);
                const data = await res.json();
                setResults(data.results || []);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }

        const debounce = setTimeout(search, 300);
        return () => clearTimeout(debounce);
    }, [query, location]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Search Header */}
                <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-12 px-4">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-3xl font-bold mb-6">Search Salaries</h1>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Job title..."
                                    className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 dark:border dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Location..."
                                    className="h-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 dark:border dark:border-gray-700 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Results */}
                <section className="py-8 px-4">
                    <div className="container mx-auto max-w-4xl">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <p className="mt-4 text-gray-500 dark:text-gray-400">Searching...</p>
                            </div>
                        ) : results.length > 0 ? (
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    {results.length} results found
                                </p>
                                <div className="space-y-3">
                                    {results.map((result, index) => (
                                        <Link
                                            key={index}
                                            href={result.href}
                                            className="block p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="text-xs uppercase font-medium text-blue-600 dark:text-blue-400">
                                                        {result.type}
                                                    </span>
                                                    <h2 className="font-semibold text-gray-900 dark:text-white mt-1">
                                                        {result.title}
                                                    </h2>
                                                    {result.subtitle && (
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {result.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                                {result.salary && (
                                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                                        {result.salary}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ) : query || location ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    No results found. Try a different search term.
                                </p>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">
                                    Enter a job title or location to search
                                </p>
                                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                    <Link
                                        href="/occupations"
                                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                                    >
                                        Browse Occupations
                                    </Link>
                                    <Link
                                        href="/locations"
                                        className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        Browse Locations
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
