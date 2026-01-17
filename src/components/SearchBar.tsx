/**
 * SearchBar - Job and location search component with autocomplete
 *
 * Provides real-time autocomplete search for occupations and locations
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface SearchResult {
    type: 'occupation' | 'location' | 'salary';
    title: string;
    subtitle?: string;
    url: string;
    salary?: string;
}

interface SearchBarProps {
    placeholder?: string;
    className?: string;
    size?: 'default' | 'lg';
    filterType?: 'all' | 'occupations' | 'locations';
}

// Debounce hook for API calls
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

export function SearchBar({
    placeholder = 'Search jobs or locations...',
    className = '',
    size = 'default',
    filterType = 'all',
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const debouncedQuery = useDebounce(query, 200);

    // Update dropdown position when input is focused or results change
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY + 8,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen, results]);

    // Fetch results when query changes
    useEffect(() => {
        async function fetchResults() {
            if (debouncedQuery.length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    const formattedResults: SearchResult[] = [];

                    // Add occupations (unless filtering for locations only)
                    if (filterType !== 'locations') {
                        data.occupations?.slice(0, filterType === 'occupations' ? 8 : 5).forEach((occ: { occ_title: string; slug: string; avg_salary?: number }) => {
                            formattedResults.push({
                                type: 'occupation',
                                title: occ.occ_title,
                                subtitle: occ.avg_salary ? `Avg: $${Math.round(occ.avg_salary).toLocaleString()}` : undefined,
                                url: `/occupations/${occ.slug}`,
                            });
                        });
                    }

                    // Add locations (unless filtering for occupations only)
                    if (filterType !== 'occupations') {
                        data.locations?.slice(0, filterType === 'locations' ? 8 : 5).forEach((loc: { area_title: string; slug: string; state_abbr?: string }) => {
                            formattedResults.push({
                                type: 'location',
                                title: loc.area_title,
                                subtitle: loc.state_abbr || undefined,
                                url: `/locations/${loc.slug}`,
                            });
                        });
                    }

                    setResults(formattedResults);
                    setIsOpen(formattedResults.length > 0);
                    setSelectedIndex(-1);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchResults();
    }, [debouncedQuery, filterType]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isOpen) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (selectedIndex >= 0 && results[selectedIndex]) {
                        router.push(results[selectedIndex].url);
                        setIsOpen(false);
                        setQuery('');
                    } else if (query.trim()) {
                        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                        setIsOpen(false);
                    }
                    break;
                case 'Escape':
                    setIsOpen(false);
                    setSelectedIndex(-1);
                    break;
            }
        },
        [isOpen, results, selectedIndex, query, router]
    );

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            if (query.trim()) {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                setIsOpen(false);
            }
        },
        [query, router]
    );

    const inputClasses = size === 'lg' ? 'h-14 text-lg px-6' : 'h-10';
    const buttonClasses = size === 'lg' ? 'h-14 px-8 text-lg' : '';

    return (
        <>
            <form onSubmit={handleSubmit} className={`relative ${className}`} ref={formRef}>
                <div className="flex gap-2">
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
                        <input
                            ref={inputRef}
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onFocus={() => results.length > 0 && setIsOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className={`w-full pl-10 pr-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${inputClasses}`}
                            autoComplete="off"
                        />
                        {isLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        )}
                    </div>
                    <Button type="submit" className={buttonClasses}>
                        Search
                    </Button>
                </div>
            </form>

            {/* Autocomplete Dropdown - Fixed Position Portal */}
            {isOpen && results.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                    style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                    }}
                >
                    {results.map((result, index) => (
                        <button
                            key={`${result.type}-${result.url}`}
                            type="button"
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                                index === selectedIndex
                                    ? 'bg-blue-100 dark:bg-blue-800/50'
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => {
                                router.push(result.url);
                                setIsOpen(false);
                                setQuery('');
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            {/* Icon based on type */}
                            <div
                                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                    result.type === 'occupation'
                                        ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                                        : 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                                }`}
                            >
                                {result.type === 'occupation' ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">
                                    {result.title}
                                </div>
                                {result.subtitle && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {result.subtitle}
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                {result.type === 'occupation' ? 'Job' : 'Location'}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </>
    );
}

interface HeroSearchProps {
    className?: string;
}

export function HeroSearch({ className = '' }: HeroSearchProps) {
    const [jobQuery, setJobQuery] = useState('');
    const [locationQuery, setLocationQuery] = useState('');
    const [jobResults, setJobResults] = useState<SearchResult[]>([]);
    const [locationResults, setLocationResults] = useState<SearchResult[]>([]);
    const [activeField, setActiveField] = useState<'job' | 'location' | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
    const router = useRouter();
    const jobInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);
    const jobDropdownRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);

    const debouncedJobQuery = useDebounce(jobQuery, 200);
    const debouncedLocationQuery = useDebounce(locationQuery, 200);

    // Update dropdown position when active field changes
    useEffect(() => {
        if (activeField === 'job' && jobInputRef.current) {
            const rect = jobInputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        } else if (activeField === 'location' && locationInputRef.current) {
            const rect = locationInputRef.current.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.left,
                width: rect.width,
            });
        }
    }, [activeField, jobResults, locationResults]);

    // Fetch job results
    useEffect(() => {
        async function fetchJobResults() {
            if (debouncedJobQuery.length < 2) {
                setJobResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedJobQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    const results: SearchResult[] = [];
                    data.occupations?.slice(0, 6).forEach((occ: { occ_title: string; slug: string; avg_salary?: number }) => {
                        results.push({
                            type: 'occupation',
                            title: occ.occ_title,
                            subtitle: occ.avg_salary ? `Avg: $${Math.round(occ.avg_salary).toLocaleString()}/yr` : undefined,
                            url: `/occupations/${occ.slug}`,
                        });
                    });
                    setJobResults(results);
                    setSelectedIndex(-1);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchJobResults();
    }, [debouncedJobQuery]);

    // Fetch location results
    useEffect(() => {
        async function fetchLocationResults() {
            if (debouncedLocationQuery.length < 2) {
                setLocationResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?location=${encodeURIComponent(debouncedLocationQuery)}`);
                if (response.ok) {
                    const data = await response.json();
                    const results: SearchResult[] = [];
                    data.locations?.slice(0, 6).forEach((loc: { area_title: string; slug: string; state_abbr?: string }) => {
                        results.push({
                            type: 'location',
                            title: loc.area_title,
                            subtitle: loc.state_abbr || undefined,
                            url: `/locations/${loc.slug}`,
                        });
                    });
                    setLocationResults(results);
                    setSelectedIndex(-1);
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLocationResults();
    }, [debouncedLocationQuery]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Node;
            const isClickInsideJobDropdown = jobDropdownRef.current?.contains(target);
            const isClickInsideLocationDropdown = locationDropdownRef.current?.contains(target);
            const isClickInsideJobInput = jobInputRef.current?.contains(target);
            const isClickInsideLocationInput = locationInputRef.current?.contains(target);

            if (!isClickInsideJobDropdown && !isClickInsideLocationDropdown && !isClickInsideJobInput && !isClickInsideLocationInput) {
                setActiveField(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent, field: 'job' | 'location') => {
            const results = field === 'job' ? jobResults : locationResults;
            if (results.length === 0) return;

            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
                    break;
                case 'Enter':
                    if (selectedIndex >= 0 && results[selectedIndex]) {
                        e.preventDefault();
                        if (field === 'job') {
                            setJobQuery(results[selectedIndex].title);
                        } else {
                            setLocationQuery(results[selectedIndex].title);
                        }
                        setActiveField(null);
                        setSelectedIndex(-1);
                    }
                    break;
                case 'Escape':
                    setActiveField(null);
                    setSelectedIndex(-1);
                    break;
            }
        },
        [jobResults, locationResults, selectedIndex]
    );

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

    const selectResult = (result: SearchResult, field: 'job' | 'location') => {
        if (field === 'job') {
            setJobQuery(result.title);
        } else {
            setLocationQuery(result.title);
        }
        setActiveField(null);
        setSelectedIndex(-1);
    };

    return (
        <>
        <form
            onSubmit={handleSubmit}
            className={`bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20 shadow-2xl ${className}`}
        >
            <div className="flex flex-col sm:flex-row gap-2">
                {/* Job Input */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                        ref={jobInputRef}
                        type="text"
                        value={jobQuery}
                        onChange={(e) => setJobQuery(e.target.value)}
                        onFocus={() => {
                            setActiveField('job');
                            setSelectedIndex(-1);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, 'job')}
                        placeholder="Job title..."
                        className="w-full h-14 pl-12 pr-4 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl border-0 dark:border dark:border-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                        autoComplete="off"
                    />
                    {isLoading && activeField === 'job' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Location Input */}
                <div className="relative flex-1">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
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
                        ref={locationInputRef}
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onFocus={() => {
                            setActiveField('location');
                            setSelectedIndex(-1);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, 'location')}
                        placeholder="Location..."
                        className="w-full h-14 pl-12 pr-4 text-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl border-0 dark:border dark:border-gray-700 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
                        autoComplete="off"
                    />
                    {isLoading && activeField === 'location' && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
                >
                    Find Salaries
                </Button>
            </div>
        </form>

        {/* Job Autocomplete Dropdown - Fixed Position Portal */}
        {activeField === 'job' && jobResults.length > 0 && (
            <div
                ref={jobDropdownRef}
                className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                }}
            >
                {jobResults.map((result, index) => (
                    <button
                        key={result.url}
                        type="button"
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            index === selectedIndex
                                ? 'bg-blue-100 dark:bg-blue-800/50'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => selectResult(result, 'job')}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                            </div>
                            {result.subtitle && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {result.subtitle}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        )}

        {/* Location Autocomplete Dropdown - Fixed Position Portal */}
        {activeField === 'location' && locationResults.length > 0 && (
            <div
                ref={locationDropdownRef}
                className="fixed z-[9999] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden"
                style={{
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                }}
            >
                {locationResults.map((result, index) => (
                    <button
                        key={result.url}
                        type="button"
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            index === selectedIndex
                                ? 'bg-blue-100 dark:bg-blue-800/50'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => selectResult(result, 'location')}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                                {result.title}
                            </div>
                            {result.subtitle && (
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {result.subtitle}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        )}
    </>
    );
}
