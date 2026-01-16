# SalaryScout Architecture

> **Project**: SalaryScout - Salary Data by Occupation and Location
> **Data Source**: BLS OEWS (Occupational Employment and Wage Statistics)
> **Pattern**: Programmatic SEO - "[Job] salary in [City]"

---

## 1. Data Model

### 1.1 Source Data Structure (BLS OEWS)

The BLS OEWS data provides salary and employment statistics with these key columns:

| Column | Type | Description |
|--------|------|-------------|
| OCC_CODE | VARCHAR(10) | SOC code (e.g., "15-1252") |
| OCC_TITLE | VARCHAR(255) | Occupation name |
| OCC_GROUP | VARCHAR(20) | "detailed", "major", "total" |
| AREA_CODE | VARCHAR(10) | MSA code (e.g., "C3562") |
| AREA_TITLE | VARCHAR(255) | Metro area name |
| TOT_EMP | INTEGER | Total employment count |
| H_MEAN | DECIMAL | Hourly mean wage |
| A_MEAN | DECIMAL | Annual mean wage |
| A_MEDIAN | DECIMAL | Annual median wage |
| A_PCT10 | DECIMAL | 10th percentile annual |
| A_PCT25 | DECIMAL | 25th percentile annual |
| A_PCT75 | DECIMAL | 75th percentile annual |
| A_PCT90 | DECIMAL | 90th percentile annual |

### 1.2 Database Schema

```sql
-- Occupations lookup table
CREATE TABLE occupations (
    id SERIAL PRIMARY KEY,
    occ_code VARCHAR(10) UNIQUE NOT NULL,
    occ_title VARCHAR(255) NOT NULL,
    occ_group VARCHAR(20) NOT NULL,        -- detailed, major, total
    slug VARCHAR(255) UNIQUE NOT NULL,      -- SEO-friendly URL slug
    major_group VARCHAR(50),                -- Category grouping
    description TEXT,                       -- AI-generated if needed
    is_indexable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Metro areas lookup table
CREATE TABLE metros (
    id SERIAL PRIMARY KEY,
    area_code VARCHAR(10) UNIQUE NOT NULL,
    area_title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,      -- SEO-friendly URL slug
    state_abbr VARCHAR(2),                  -- Extracted from area_title
    state_name VARCHAR(50),
    is_indexable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Main salary data (occupation × metro combinations)
CREATE TABLE salary_data (
    id SERIAL PRIMARY KEY,
    occupation_id INTEGER REFERENCES occupations(id),
    metro_id INTEGER REFERENCES metros(id),
    tot_emp INTEGER,
    h_mean DECIMAL(10,2),
    a_mean DECIMAL(12,2),
    a_median DECIMAL(12,2),
    a_pct10 DECIMAL(12,2),
    a_pct25 DECIMAL(12,2),
    a_pct75 DECIMAL(12,2),
    a_pct90 DECIMAL(12,2),
    dqs DECIMAL(3,2) DEFAULT 0.00,          -- Data Quality Score 0-1
    is_indexable BOOLEAN DEFAULT TRUE,
    data_year INTEGER DEFAULT 2024,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(occupation_id, metro_id)
);

-- Indexes for performance
CREATE INDEX idx_salary_occupation ON salary_data(occupation_id);
CREATE INDEX idx_salary_metro ON salary_data(metro_id);
CREATE INDEX idx_salary_indexable ON salary_data(is_indexable) WHERE is_indexable = TRUE;
CREATE INDEX idx_occupations_slug ON occupations(slug);
CREATE INDEX idx_metros_slug ON metros(slug);
CREATE INDEX idx_metros_state ON metros(state_abbr);
```

### 1.3 Data Quality Score (DQS) Calculation

```typescript
function calculateDQS(row: SalaryDataRow): number {
    let score = 0;

    // Has employment data (30%)
    if (row.tot_emp && row.tot_emp > 0) score += 0.30;

    // Has mean salary (25%)
    if (row.a_mean && row.a_mean > 0) score += 0.25;

    // Has median salary (20%)
    if (row.a_median && row.a_median > 0) score += 0.20;

    // Has wage percentiles (15%)
    if (row.a_pct10 && row.a_pct25 && row.a_pct75 && row.a_pct90) score += 0.15;

    // Has significant employment (10%)
    if (row.tot_emp && row.tot_emp >= 100) score += 0.10;

    return Math.round(score * 100) / 100;
}

// Indexability rule: DQS >= 0.50 AND has median salary
const is_indexable = dqs >= 0.50 && a_median > 0;
```

---

## 2. Route Architecture

### 2.1 Route Structure (Programmatic SEO Optimized)

| Route | Type | Page Count | Purpose |
|-------|------|------------|---------|
| `/` | Static | 1 | Homepage with stats, search, featured |
| `/occupations` | Hub | 1 | Browse all occupations by category |
| `/occupations/[slug]` | Entity | ~830 | Occupation detail with all metros |
| `/locations` | Hub | 1 | Browse all metro areas by state |
| `/locations/[slug]` | Entity | ~530 | Metro detail with all occupations |
| `/salary/[occ-slug]/[metro-slug]` | Money Page | ~100K+ | **PRIMARY SEO TARGET** |
| `/search` | Utility | 1 | Client-side search |

### 2.2 URL Examples

```
/                                           → Homepage
/occupations                                → Browse occupations
/occupations/software-developer             → Software Developer overview
/locations                                  → Browse locations
/locations/new-york-city-ny                 → NYC overview
/salary/software-developer/new-york-city-ny → **THE MONEY PAGE**
/salary/nurse/chicago-il
/salary/teacher/los-angeles-ca
/search?q=engineer                          → Search results
```

### 2.3 Page Count Estimation

| Page Type | Count | Indexable |
|-----------|-------|-----------|
| Home | 1 | Yes |
| Occupation Hub | 1 | Yes |
| Occupation Detail | 830 | ~800 (filter majors) |
| Location Hub | 1 | Yes |
| Location Detail | 530 | ~500 (filter small) |
| **Salary Pages** | **~440K** | **~100K** (filter low DQS) |
| Search | 1 | No |
| **TOTAL** | ~441K | **~101K indexable** |

---

## 3. Component Architecture

### 3.1 App Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── occupations/
│   │   ├── page.tsx            # Occupation hub
│   │   └── [slug]/
│   │       └── page.tsx        # Occupation detail
│   ├── locations/
│   │   ├── page.tsx            # Location hub
│   │   └── [slug]/
│   │       └── page.tsx        # Location detail
│   ├── salary/
│   │   └── [occupation]/
│   │       └── [location]/
│   │           └── page.tsx    # Money page
│   ├── search/
│   │   └── page.tsx            # Search
│   ├── sitemap.ts              # Dynamic sitemap
│   └── robots.ts               # Robots.txt
├── components/
│   ├── ui/                     # magic-ui components
│   ├── SalaryCard.tsx
│   ├── OccupationCard.tsx
│   ├── LocationCard.tsx
│   ├── SalaryTable.tsx
│   ├── SearchBar.tsx
│   └── AdPlaceholder.tsx       # For future ads
├── lib/
│   ├── db.ts                   # Database queries
│   ├── utils.ts                # Helpers
│   └── constants.ts            # Slugify, validation
└── types/
    └── index.ts                # TypeScript types
```

### 3.2 Key Components

**SalaryCard** (used on occupation/location pages):
```tsx
interface SalaryCardProps {
    occupation: string;
    location: string;
    median: number;
    range: { low: number; high: number };
    employment: number;
}
```

**Money Page Layout**:
```
┌─────────────────────────────────────────────┐
│ H1: Software Developer Salary in New York   │
│ Lead: $145,000 median annual salary         │
├─────────────────────────────────────────────┤
│ Salary Overview Card                        │
│ ┌─────────┬─────────┬─────────┬─────────┐   │
│ │ 10th %  │ Median  │ Mean    │ 90th %  │   │
│ │ $85K    │ $145K   │ $152K   │ $210K   │   │
│ └─────────┴─────────┴─────────┴─────────┘   │
├─────────────────────────────────────────────┤
│ Salary Distribution Chart                   │
├─────────────────────────────────────────────┤
│ Related Occupations in New York             │
│ [Cards linking to other salary pages]       │
├─────────────────────────────────────────────┤
│ Software Developer Salaries Nationwide      │
│ [Table of top metros]                       │
├─────────────────────────────────────────────┤
│ [Ad Placeholder]                            │
├─────────────────────────────────────────────┤
│ JSON-LD Structured Data                     │
└─────────────────────────────────────────────┘
```

---

## 4. SEO Strategy

### 4.1 Title Templates

```typescript
const titleTemplates = {
    home: "SalaryScout | Salary Data by Job & Location",
    occupationHub: "Browse All Occupations | SalaryScout",
    occupation: "{occupation} Salary - National Average & Top Cities | SalaryScout",
    locationHub: "Browse Salaries by Location | SalaryScout",
    location: "Salaries in {location} - Top Jobs & Pay | SalaryScout",
    salary: "{occupation} Salary in {location} 2024 | SalaryScout",
};
```

### 4.2 Meta Description Templates

```typescript
const descriptionTemplates = {
    salary: "The median {occupation} salary in {location} is ${median}. " +
            "See salary range from ${low} to ${high}, plus employment data and trends."
};
```

### 4.3 JSON-LD Structured Data

```json
{
    "@context": "https://schema.org",
    "@type": "OccupationalExperienceRequirements",
    "name": "Software Developer in New York",
    "occupationalCategory": "15-1252",
    "estimatedSalary": {
        "@type": "MonetaryAmountDistribution",
        "currency": "USD",
        "duration": "P1Y",
        "median": 145000,
        "percentile10": 85000,
        "percentile90": 210000
    }
}
```

### 4.4 Internal Linking Strategy

Each salary page links to:
- Same occupation in other metros (top 10 by salary)
- Same metro with other occupations (top 10 by salary)
- Parent occupation page
- Parent metro page
- Breadcrumbs: Home > Occupations > Software Developer > New York

---

## 5. Performance Optimization

### 5.1 Caching Strategy

```typescript
// Salary pages - revalidate weekly
export const revalidate = 604800; // 7 days

// Static generation for top pages
export async function generateStaticParams() {
    // Pre-build top 1000 most popular combinations
    const topPages = await db.query(`
        SELECT o.slug as occ_slug, m.slug as metro_slug
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.is_indexable = TRUE
        ORDER BY sd.tot_emp DESC
        LIMIT 1000
    `);
    return topPages;
}
```

### 5.2 Database Query Optimization

```sql
-- Optimized query for salary page
SELECT
    o.occ_title, o.slug as occ_slug,
    m.area_title, m.slug as metro_slug, m.state_abbr,
    sd.a_median, sd.a_mean, sd.a_pct10, sd.a_pct25, sd.a_pct75, sd.a_pct90,
    sd.tot_emp, sd.h_mean
FROM salary_data sd
JOIN occupations o ON sd.occupation_id = o.id
JOIN metros m ON sd.metro_id = m.id
WHERE o.slug = $1 AND m.slug = $2
LIMIT 1;
```

---

## 6. Sitemap Strategy

### 6.1 Paginated Sitemaps

With ~100K indexable pages, sitemaps must be paginated (50,000 URLs max per sitemap):

```
/sitemap.xml        → Sitemap index
/sitemap-0.xml      → Pages 1-50,000
/sitemap-1.xml      → Pages 50,001-100,000
/sitemap-2.xml      → Remaining
```

### 6.2 Sitemap Generation

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    // Get all indexable salary pages
    const salaryPages = await db.query(`
        SELECT o.slug as occ_slug, m.slug as metro_slug
        FROM salary_data sd
        JOIN occupations o ON sd.occupation_id = o.id
        JOIN metros m ON sd.metro_id = m.id
        WHERE sd.is_indexable = TRUE
    `);

    return salaryPages.map(page => ({
        url: `${baseUrl}/salary/${page.occ_slug}/${page.metro_slug}`,
        lastModified: new Date(),
        changeFrequency: 'yearly',
        priority: 0.8,
    }));
}
```

---

## 7. Data Ingestion Plan

### 7.1 Source Files

Download from: https://www.bls.gov/oes/tables.htm
- `oesm24ma.zip` - Metro area data (primary)
- May 2024 release (latest)

### 7.2 Ingestion Steps

1. Download and extract ZIP
2. Parse Excel/CSV files
3. Create occupations from unique OCC_CODE/OCC_TITLE
4. Create metros from unique AREA_CODE/AREA_TITLE
5. Batch insert salary_data (1000 rows per batch)
6. Calculate DQS scores
7. Set is_indexable flags
8. Verify counts

### 7.3 Slug Generation

```typescript
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '-')           // Spaces to hyphens
        .replace(/-+/g, '-')            // Collapse multiple hyphens
        .trim();
}

// Examples:
// "Software Developers" → "software-developers"
// "New York-Newark-Jersey City, NY-NJ-PA" → "new-york-newark-jersey-city-ny-nj-pa"
```

---

## 8. Storage Estimation

| Table | Rows | Avg Size | Total |
|-------|------|----------|-------|
| occupations | 830 | ~500 bytes | ~0.4 MB |
| metros | 530 | ~300 bytes | ~0.2 MB |
| salary_data | 440,000 | ~200 bytes | ~88 MB |
| Indexes | - | - | ~50 MB |
| **TOTAL** | | | **~140 MB** |

**Free tier safe**: 140 MB << 500 MB limit

---

## 9. Phase Checklist

- [x] Phase 2.1: Analyzed BLS OEWS data structure
- [x] Phase 2.2: Designed database schema
- [x] Phase 2.3: Planned route structure for pSEO
- [x] Phase 2.4: Written architecture.md

**Ready for Phase 3: Database & Schema Implementation**
