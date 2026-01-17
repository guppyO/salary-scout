/**
 * SalaryCard - Modern component for displaying salary statistics
 *
 * Features glassmorphism, gradients, and smooth animations
 */

import { formatSalary, formatNumber } from '@/lib/seo';

interface SalaryCardProps {
    occupation: string;
    location: string;
    median: number | null;
    mean: number | null;
    pct10: number | null;
    pct25: number | null;
    pct75: number | null;
    pct90: number | null;
    hourlyMean: number | null;
    employment: number | null;
    className?: string;
}

export function SalaryCard({
    occupation,
    location,
    median,
    mean,
    pct10,
    pct25,
    pct75,
    pct90,
    hourlyMean,
    employment,
    className = '',
}: SalaryCardProps) {
    // Calculate median position in range for visual indicator
    const medianPosition = pct10 && pct90 && median
        ? Math.min(Math.max(((median - pct10) / (pct90 - pct10)) * 100, 5), 95)
        : 50;

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden ${className}`}>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white p-6 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />
                </div>

                <div className="relative flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <h2 className="text-lg font-semibold leading-tight truncate">
                            {occupation}
                        </h2>
                        <p className="text-blue-200 text-sm mt-1 flex items-center gap-1.5">
                            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{location}</span>
                        </p>
                    </div>
                    {employment && (
                        <div className="flex-shrink-0 bg-white/15 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {formatNumber(employment)}
                        </div>
                    )}
                </div>

                {/* Median Salary - Prominent Display */}
                <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-blue-200 text-xs font-medium uppercase tracking-wider">
                        Median Annual Salary
                    </p>
                    <div className="flex items-baseline gap-3 mt-1">
                        <span className="text-4xl font-bold tracking-tight">
                            {formatSalary(median)}
                        </span>
                        {hourlyMean && (
                            <span className="text-blue-200 text-sm">
                                ({formatSalary(hourlyMean)}/hr)
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Salary Range Visualization */}
                {pct10 && pct90 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                Salary Range
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                10th - 90th percentile
                            </span>
                        </div>

                        {/* Range bar */}
                        <div className="relative mb-2">
                            <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600 rounded-full" />
                            </div>
                            {/* Median indicator */}
                            {median && (
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-blue-600 rounded-full shadow-md"
                                    style={{ left: `calc(${medianPosition}% - 8px)` }}
                                />
                            )}
                        </div>

                        {/* Range labels */}
                        <div className="flex justify-between text-sm">
                            <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatSalary(pct10)}
                                </span>
                            </div>
                            <div className="text-center">
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                    {formatSalary(median)}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 text-xs ml-1">median</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                    {formatSalary(pct90)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {mean && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                Mean Salary
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(mean)}
                            </p>
                        </div>
                    )}
                    {pct25 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                25th Percentile
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(pct25)}
                            </p>
                        </div>
                    )}
                    {pct75 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                75th Percentile
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(pct75)}
                            </p>
                        </div>
                    )}
                    {employment && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium uppercase tracking-wider">
                                Total Employment
                            </p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                                {formatNumber(employment)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
