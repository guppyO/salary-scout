/**
 * Footer - Site footer with links and data attribution
 */

import Link from 'next/link';

// Data period - update when ingesting new BLS data
// This could also come from process.env.NEXT_PUBLIC_DATA_PERIOD
const DATA_PERIOD = 'May 2024';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative border-t border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 pointer-events-none" />

            <div className="relative container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <Link href="/" className="group inline-flex items-center space-x-2">
                            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                                <svg
                                    className="h-6 w-6 text-white"
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
                            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                SalaryScout
                            </span>
                        </Link>
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Explore salary data for 800+ occupations across 390+ metro areas.
                            Powered by official BLS data.
                        </p>
                        {/* Social/Trust badges */}
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Official BLS Data
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Data: {DATA_PERIOD}
                            </span>
                        </div>
                    </div>

                    {/* Browse */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Browse
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/occupations"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>All Occupations</span>
                                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/locations"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>All Locations</span>
                                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/search"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>Search</span>
                                    <svg className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Popular Searches */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Popular Searches
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                    href="/occupations/software-developers"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    Software Developer Salary
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/occupations/registered-nurses"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    Nurse Salary
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/occupations/accountants-and-auditors"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    Accountant Salary
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/locations/new-york-newark-jersey-city-ny-nj-pa"
                                    className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                                >
                                    New York Salaries
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Data Source */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">
                            Data Source
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            Salary data from the U.S. Bureau of Labor Statistics
                            Occupational Employment and Wage Statistics (OEWS) program.
                        </p>
                        <a
                            href="https://www.bls.gov/oes/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        >
                            <span>Learn more at BLS.gov</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </a>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-800/50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            &copy; {currentYear} SalaryScout. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6">
                            <Link
                                href="/privacy"
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="/terms"
                                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                            >
                                Terms of Use
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
