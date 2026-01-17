import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Salaries',
    description: 'Search salary data for any occupation or location. Find median salaries, wage ranges, and employment statistics.',
    robots: {
        index: false, // Search pages are thin content, don't index
        follow: true,
    },
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
