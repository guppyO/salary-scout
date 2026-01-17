/**
 * Component exports for SalaryScout
 */

// Layout components
export { Header } from './Header';
export { Footer } from './Footer';

// Theme components
export { ThemeProvider, ThemeToggle, useTheme } from './ThemeProvider';

// Card components
export { SalaryCard } from './SalaryCard';
export { OccupationCard, LocationCard, SalaryLinkCard } from './OccupationCard';
export { StatCard, Icons } from './StatCard';

// Form components
export { SearchBar, HeroSearch } from './SearchBar';

// SEO components
export {
    WebsiteJsonLd,
    SalaryJsonLd,
    BreadcrumbJsonLd,
    FAQJsonLd,
    createSalaryJsonLdFromData,
} from './JsonLd';

// Ad components
export { AdUnit } from './AdUnit';
