# Automated Deployment Guide

## Overview

The agent handles ALL deployment automatically. User provides minimal credentials, agent does the rest.

## Required User Input

**File: `../Supabase.txt`** (one level up from project)

```
PROJECT_ID=<supabase-project-id>
PASSWORD=<database-password>
POOLER_REGION=<aws-region>
```

That's it. Agent constructs everything else.

---

## Agent Automated Workflow

### Step 1: Read Credentials

```bash
# Agent reads Supabase.txt from parent directory
cat ../Supabase.txt
```

Parse values:
- `PROJECT_ID` - Supabase project ID
- `PASSWORD` - Database password
- `POOLER_REGION` - Pooler region (e.g., `aws-1-eu-west-3`)

### Step 2: Construct URLs

**Pooler URL (for Vercel - required):**
```
postgresql://postgres.{PROJECT_ID}:{PASSWORD}@{POOLER_REGION}.pooler.supabase.com:6543/postgres
```

**Direct URL (for local dev/migrations):**
```
postgresql://postgres:{PASSWORD}@db.{PROJECT_ID}.supabase.co:5432/postgres
```

### Step 3: Create .env.local

```bash
# Agent writes .env.local automatically
DATABASE_URL=postgresql://postgres.{PROJECT_ID}:{PASSWORD}@{POOLER_REGION}.pooler.supabase.com:6543/postgres
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 4: Verify Build

```bash
npm run build
```

Must pass before deployment.

### Step 5: Deploy to Vercel

```bash
# Link project (creates .vercel folder)
npx vercel link --yes

# Set environment variables
npx vercel env add DATABASE_URL production <<< "postgresql://postgres.{PROJECT_ID}:{PASSWORD}@{POOLER_REGION}.pooler.supabase.com:6543/postgres"
npx vercel env add NEXT_PUBLIC_SITE_URL production <<< "https://{vercel-url}.vercel.app"

# Deploy to production
npx vercel --prod
```

### Step 6: Verify Deployment

```bash
# Test homepage loads
curl -I https://{deployed-url}.vercel.app

# Test a data page
curl -I https://{deployed-url}.vercel.app/occupations
```

---

## URL Construction Reference

| Component | Template |
|-----------|----------|
| Pooler Host | `{POOLER_REGION}.pooler.supabase.com` |
| Pooler Port | `6543` |
| Direct Host | `db.{PROJECT_ID}.supabase.co` |
| Direct Port | `5432` |
| User (Pooler) | `postgres.{PROJECT_ID}` |
| User (Direct) | `postgres` |
| Database | `postgres` |

**Full Pooler URL:**
```
postgresql://postgres.{PROJECT_ID}:{PASSWORD}@{POOLER_REGION}.pooler.supabase.com:6543/postgres
```

**Full Direct URL:**
```
postgresql://postgres:{PASSWORD}@db.{PROJECT_ID}.supabase.co:5432/postgres
```

---

## Vercel Environment Variables

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Pooler URL (constructed above) | Yes |
| `NEXT_PUBLIC_SITE_URL` | Production domain or Vercel URL | Yes |

---

## Common Issues

### 1. ECONNREFUSED 127.0.0.1:5432
**Cause:** DATABASE_URL not set in Vercel
**Fix:** Add DATABASE_URL env var using pooler URL

### 2. Too many connections
**Cause:** Using direct URL instead of pooler
**Fix:** Always use pooler URL (port 6543) for Vercel

### 3. Oversized ISR page
**Cause:** Sitemap file too large (>19MB)
**Fix:** Reduce URLS_PER_SITEMAP (10K is safe)

### 4. NaN in sitemap params (Next.js 16)
**Cause:** Wrong function signature
**Fix:** Use `props: { id: Promise<string> }` and `await props.id`

---

## Agent Checklist

- [ ] Read `../Supabase.txt` for credentials
- [ ] Construct pooler URL automatically
- [ ] Write `.env.local` with constructed URL
- [ ] Verify `npm run build` passes
- [ ] Run `npx vercel link --yes`
- [ ] Add DATABASE_URL to Vercel env vars
- [ ] Add NEXT_PUBLIC_SITE_URL to Vercel env vars
- [ ] Run `npx vercel --prod`
- [ ] Verify production URL loads
- [ ] Run Lighthouse audit

**NEVER ask user for URLs or credentials that can be constructed from Supabase.txt**
