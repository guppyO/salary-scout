/**
 * Privacy Policy page
 */

import { Metadata } from 'next';
import { Header, Footer } from '@/components';

export const metadata: Metadata = {
    title: 'Privacy Policy | SalaryScout',
    description: 'Privacy policy for SalaryScout - Learn how we handle your data and protect your privacy.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
            <Header />

            <main className="flex-1">
                {/* Hero */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-950 text-white py-16">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
                        <p className="text-blue-100 mt-2">Last updated: January 2026</p>
                    </div>
                </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-blue-500/5 border border-gray-100 dark:border-gray-800 p-8 md:p-12">
                    <div className="prose dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Introduction</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            SalaryScout (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy.
                            This Privacy Policy explains how we collect, use, and safeguard information when you
                            visit our website.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Information We Collect</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            We collect minimal information to provide and improve our services:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2 mb-6">
                            <li><strong>Usage Data:</strong> We may collect anonymous usage data such as pages visited, time spent on pages, and general navigation patterns to improve our service.</li>
                            <li><strong>Search Queries:</strong> Search terms entered on our site may be logged anonymously to improve search functionality.</li>
                            <li><strong>Technical Data:</strong> Browser type, device type, and IP address may be collected for security and analytics purposes.</li>
                        </ul>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Data Source</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            All salary data displayed on SalaryScout comes from the U.S. Bureau of Labor Statistics
                            (BLS) Occupational Employment and Wage Statistics (OEWS) program. This is publicly
                            available government data. We do not collect or store personal salary information
                            from our users.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Cookies</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We may use cookies and similar technologies to enhance your experience, remember
                            your preferences (such as dark mode settings), and analyze site traffic. You can
                            control cookie settings through your browser preferences.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Third-Party Services</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We may use third-party analytics services to help understand how visitors use our
                            site. These services may collect information about your visits to our site and
                            other websites.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Data Security</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We implement appropriate security measures to protect against unauthorized access,
                            alteration, disclosure, or destruction of data. However, no internet transmission
                            is completely secure.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Your Rights</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Since we collect minimal personal information, there is typically no personal data
                            to access, correct, or delete. If you have questions about your data, please contact us.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Changes to This Policy</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            We may update this Privacy Policy from time to time. We will notify you of any
                            changes by posting the new Privacy Policy on this page and updating the
                            &quot;Last updated&quot; date.
                        </p>

                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 mt-8">Contact Us</h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            If you have any questions about this Privacy Policy, please contact us through
                            our website.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
