/**
 * SearchBar - Job and location search component
 *
 * Provides autocomplete search for occupations and locations
 */

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    size?: 'default' | 'lg';
}

export function SearchBar({
    placeholder = 'Search jobs or locations...',
    className = '',
    size = 'default',
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
            }
        },
        [query, router]
    );

    const inputClasses = size === 'lg' ? 'h-14 text-lg px-6' : 'h-10';
    const buttonClasses = size === 'lg' ? 'h-14 px-8 text-lg' : '';

    return (
        <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
            <div className="relative flex-1">
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                <Input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className={`pl-10 ${inputClasses}`}
                />
            </div>
            <Button type="submit" className={buttonClasses}>
                Search
            </Button>
        </form>
    );
}

interface HeroSearchProps {
    className?: string;
}

export function HeroSearch({ className = '' }: HeroSearchProps) {
    const [jobQuery, setJobQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const router = useRouter();

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const params = new URLSearchParams();
            if (jobQuery.trim()) params.set('job', jobQuery.trim());
            if (locationQuery.trim()) params.set('location', locationQuery.trim());
            if (params.toString()) {
                router.push(`/search?${params.toString()}`);
            }
        },
        [jobQuery, locationQuery, router]
    );

    return (
        <form
            onSubmit={handleSubmit}
            className={`bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl ${className}`}
        >
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        placeholder="Job title (e.g., Software Developer)"
                        className="w-full h-14 pl-12 pr-4 text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                </div>
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        placeholder="Location (e.g., New York)"
                        className="w-full h-14 pl-12 pr-4 text-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-500 rounded-xl border-0 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                </div>
                <Button type="submit" size="lg" className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all">
                    Find Salaries
                </Button>
            </div>
        </form>
    );
}
