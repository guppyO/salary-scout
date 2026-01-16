/**
 * Header - Site navigation component with dark mode toggle
 */

'use client';

import Link from 'next/link';
import { SearchBar } from './SearchBar';
import { ThemeToggle } from './ThemeProvider';

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200/80 dark:border-gray-800/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-lg group-hover:bg-blue-500/30 transition-colors rounded-full" />
                            <svg
                                className="relative h-8 w-8 text-blue-600 dark:text-blue-400"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            SalaryScout
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-1">
                        <Link
                            href="/occupations"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                            Occupations
                        </Link>
                        <Link
                            href="/locations"
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                        >
                            Locations
                        </Link>
                    </nav>

                    {/* Right side: Search + Theme Toggle */}
                    <div className="flex items-center gap-3">
                        {/* Search (Desktop) */}
                        <div className="hidden lg:block w-72">
                            <SearchBar placeholder="Search jobs or locations..." />
                        </div>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Mobile menu button */}
                        <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
