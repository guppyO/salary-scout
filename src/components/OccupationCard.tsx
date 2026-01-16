/**
 * Modern card components for displaying occupations, locations, and salary links
 * Features hover effects, gradients, and smooth animations
 */

import Link from 'next/link';
import { formatSalary, formatNumber } from '@/lib/seo';

interface OccupationCardProps {
    title: string;
    slug: string;
    medianSalary?: number | null;
    metroCount?: number;
    className?: string;
}

export function OccupationCard({
    title,
    slug,
    medianSalary,
    metroCount,
    className = '',
}: OccupationCardProps) {
    return (
        <Link href={`/occupations/${slug}`} className={`block group ${className}`}>
            <div className="relative h-full p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-blue-500/5 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 dark:group-hover:from-blue-900/10 dark:group-hover:to-indigo-900/10 rounded-xl transition-all duration-300" />

                <div className="relative">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>

                    {medianSalary && (
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                            {formatSalary(medianSalary)}
                        </p>
                    )}

                    {metroCount && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            avg. in {formatNumber(metroCount)} locations
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}

interface LocationCardProps {
    title: string;
    slug: string;
    stateAbbr?: string | null;
    occupationCount?: number;
    topSalary?: number | null;
    className?: string;
}

export function LocationCard({
    title,
    slug,
    stateAbbr,
    occupationCount,
    className = '',
}: LocationCardProps) {
    return (
        <Link href={`/locations/${slug}`} className={`block group ${className}`}>
            <div className="relative h-full p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:shadow-lg dark:hover:shadow-blue-500/5 transition-all duration-300 hover:border-blue-200 dark:hover:border-blue-800 hover:-translate-y-0.5">
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-indigo-50/0 group-hover:from-blue-50/50 group-hover:to-indigo-50/30 dark:group-hover:from-blue-900/10 dark:group-hover:to-indigo-900/10 rounded-xl transition-all duration-300" />

                <div className="relative">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {title}
                    </h3>

                    {stateAbbr && (
                        <span className="inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md">
                            {stateAbbr}
                        </span>
                    )}

                    {occupationCount && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-2 font-medium">
                            {formatNumber(occupationCount)} occupations
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}

interface SalaryLinkCardProps {
    occupation: string;
    occSlug: string;
    location: string;
    metroSlug: string;
    median: number | null;
    employment?: number | null;
    className?: string;
}

export function SalaryLinkCard({
    occupation,
    occSlug,
    location,
    metroSlug,
    median,
    className = '',
}: SalaryLinkCardProps) {
    return (
        <Link href={`/salary/${occSlug}/${metroSlug}`} className={`block group ${className}`}>
            <div className="flex justify-between items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all">
                <div className="min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {location}
                    </p>
                </div>
                <p className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
                    {formatSalary(median)}
                </p>
            </div>
        </Link>
    );
}

// Compact link for sidebar lists
interface CompactLinkProps {
    title: string;
    href: string;
    salary?: number | null;
    className?: string;
}

export function CompactSalaryLink({
    title,
    href,
    salary,
    className = '',
}: CompactLinkProps) {
    return (
        <Link href={href} className={`block group ${className}`}>
            <div className="flex justify-between items-center py-2 px-3 -mx-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate transition-colors">
                    {title}
                </span>
                {salary && (
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 shrink-0 ml-2">
                        {formatSalary(salary)}
                    </span>
                )}
            </div>
        </Link>
    );
}
