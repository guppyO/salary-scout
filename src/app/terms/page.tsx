/**
 * Terms of Use page
 */

import { Metadata } from 'next';
import { Header, Footer } from '@/components';

export const metadata: Metadata = {
    title: 'Terms of Use | SalaryScout',
    description: 'Terms of use for SalaryScout - Read our terms and conditions for using our salary data service.',
};

export default function TermsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-16">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold tracking-tight">Terms of Use</h1>
                        <p className="text-blue-100 mt-2">Last updated: January 2026</p>
                    </div>
                </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-blue-500/5 border border-gray-100 dark:border-gray-800 p-8 md:p-12">
                    <div className="prose dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            By accessing and using SalaryScout, you accept and agree to be bound by these Terms
                            of Use. If you do not agree to these terms, please do not use our website.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Description of Service</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            SalaryScout provides salary information and statistics based on publicly available
                            data from the U.S. Bureau of Labor Statistics (BLS) Occupational Employment and
                            Wage Statistics (OEWS) program. Our service is designed to help users explore
                            and compare salary data across different occupations and locations.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Data Accuracy</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            While we strive to provide accurate and up-to-date information:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                            <li>All salary data is sourced from the BLS OEWS program and reflects their published statistics.</li>
                            <li>Data is updated annually when new BLS data becomes available (typically in May).</li>
                            <li>Actual salaries may vary based on factors not captured in aggregate statistics, including experience, education, specific employer, and local market conditions.</li>
                            <li>We make no guarantees about the accuracy, completeness, or timeliness of the data.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Permitted Use</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You may use SalaryScout for:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                            <li>Personal research and career planning</li>
                            <li>Educational purposes</li>
                            <li>General informational reference</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Prohibited Use</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            You agree not to:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                            <li>Scrape, copy, or redistribute our data without permission</li>
                            <li>Use automated systems to access the site in a manner that exceeds reasonable use</li>
                            <li>Attempt to interfere with or disrupt our services</li>
                            <li>Use the service for any unlawful purpose</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Disclaimer of Warranties</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            SalaryScout is provided &quot;as is&quot; and &quot;as available&quot; without any warranties of any
                            kind, either express or implied. We do not warrant that the service will be
                            uninterrupted, error-free, or free of viruses or other harmful components.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Limitation of Liability</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            To the fullest extent permitted by law, SalaryScout shall not be liable for any
                            indirect, incidental, special, consequential, or punitive damages arising from
                            your use of or inability to use the service, including but not limited to any
                            decisions made based on salary information provided.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Intellectual Property</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            The SalaryScout name, logo, and website design are our property. The underlying
                            salary data is sourced from BLS public datasets. You may not use our branding
                            without prior written consent.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Changes to Terms</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We reserve the right to modify these Terms of Use at any time. Changes will be
                            effective immediately upon posting to this page. Your continued use of the
                            service constitutes acceptance of the modified terms.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Governing Law</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            These Terms of Use shall be governed by and construed in accordance with
                            applicable laws, without regard to conflict of law principles.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Contact</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            If you have any questions about these Terms of Use, please contact us through
                            our website.
                        </p>
                    </div>
                </div>
            </div>
            </main>

            <Footer />
        </div>
    );
}
