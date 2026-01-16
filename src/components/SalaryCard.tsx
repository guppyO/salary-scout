/**
 * SalaryCard - Modern component for displaying salary statistics
 *
 * Features glassmorphism, gradients, and smooth animations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
        ? ((median - pct10) / (pct90 - pct10)) * 100
        : 50;

    return (
        <Card className={`overflow-hidden border-0 shadow-xl dark:shadow-2xl dark:shadow-blue-500/5 ${className}`}>
            {/* Header with gradient */}
            <CardHeader className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white pb-12 overflow-hidden">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-400/20 rounded-full blur-xl" />
                </div>

                <div className="relative flex items-start justify-between">
                    <div>
                        <CardTitle className="text-xl font-semibold tracking-tight">
                            {occupation} Salary
                        </CardTitle>
                        <p className="text-blue-100 text-sm mt-1 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {location}
                        </p>
                    </div>
                    {employment && (
                        <Badge className="bg-white/20 text-white hover:bg-white/30 border-0 backdrop-blur-sm">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {formatNumber(employment)} jobs
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="pt-0 relative">
                {/* Hero Median Salary - Floating Card Effect */}
                <div className="relative -mt-8 mb-8">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-lg dark:shadow-black/20 p-6 text-center border border-gray-100 dark:border-gray-800 transition-transform hover:scale-[1.02]">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                            Median Annual Salary
                        </p>
                        <p className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                            {formatSalary(median)}
                        </p>
                        {hourlyMean && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center justify-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatSalary(hourlyMean)}/hr average
                            </p>
                        )}
                    </div>
                </div>

                {/* Salary Range Visualization */}
                {pct10 && pct90 && (
                    <div className="mb-8">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            Salary Range
                        </p>
                        <div className="relative">
                            {/* Range bar with gradient */}
                            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: '100%' }}
                                />
                            </div>
                            {/* Median indicator */}
                            {median && (
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-gray-900 border-4 border-blue-500 rounded-full shadow-lg transition-all"
                                    style={{ left: `calc(${medianPosition}% - 10px)` }}
                                />
                            )}
                            {/* Labels */}
                            <div className="flex justify-between mt-4 text-sm">
                                <div className="text-left">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">10th %</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {formatSalary(pct10)}
                                    </p>
                                </div>
                                {median && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Median</p>
                                        <p className="font-bold text-blue-600 dark:text-blue-400">
                                            {formatSalary(median)}
                                        </p>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">90th %</p>
                                    <p className="font-bold text-gray-900 dark:text-white">
                                        {formatSalary(pct90)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Additional Stats Grid - Modern Cards */}
                <div className="grid grid-cols-2 gap-3">
                    {mean && (
                        <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                Mean Salary
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(mean)}
                            </p>
                        </div>
                    )}
                    {pct25 && (
                        <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                25th Percentile
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(pct25)}
                            </p>
                        </div>
                    )}
                    {pct75 && (
                        <div className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                75th Percentile
                            </p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                {formatSalary(pct75)}
                            </p>
                        </div>
                    )}
                    {employment && (
                        <div className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700">
                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-medium">
                                Total Employment
                            </p>
                            <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                                {formatNumber(employment)}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
