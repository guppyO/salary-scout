# Autonomous Data Update System

SalaryScout includes an automated system to check for and ingest new BLS OEWS data releases.

## How It Works

```
Weekly (Monday 9 AM UTC)
         │
         ▼
┌─────────────────────────┐
│  GitHub Actions Cron    │
│  check-bls-update.yml   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Check BLS OEWS Page     │
│ for New Data Release    │
└───────────┬─────────────┘
            │
      ┌─────┴─────┐
      │           │
  New Data    No Update
      │           │
      ▼           ▼
┌───────────┐  (exit)
│ Download  │
│ & Ingest  │
│ to Supabase│
└─────┬─────┘
      │
      ▼
┌───────────────┐
│ Deploy to     │
│ Vercel        │
└───────────────┘
```

## Setup Instructions

### 1. Create the data_metadata Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the contents of: scripts/init-metadata.sql
```

Or via Supabase CLI:
```bash
supabase db execute -f scripts/init-metadata.sql
```

### 2. Configure GitHub Secrets

Go to your GitHub repo → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `DATABASE_URL` | Supabase connection string | Supabase Dashboard → Settings → Database → Connection string (URI) |
| `VERCEL_TOKEN` | Vercel API token | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Found in `.vercel/project.json` after running `vercel link` |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Found in `.vercel/project.json` after running `vercel link` |

### 3. Get Vercel IDs

Run locally:
```bash
vercel link
cat .vercel/project.json
```

The output will show:
```json
{
  "orgId": "team_xxxxx",
  "projectId": "prj_xxxxx"
}
```

### 4. Push to GitHub

The workflow will automatically run:
- Every Monday at 9 AM UTC
- On manual trigger (Actions → Check BLS Data Update → Run workflow)

## Manual Update

To manually update data:

1. Download new data from https://www.bls.gov/oes/tables.htm
2. Extract the ZIP and find the MSA Excel file
3. Place it in `data/` folder
4. Run:
   ```bash
   DATA_FILE=data/your-file.xlsx DATA_PERIOD="May 2025" npx tsx scripts/ingest-data.ts
   ```
5. Deploy:
   ```bash
   vercel --prod
   ```

## Checking Update Status

Run the check script locally:
```bash
npx tsx scripts/check-bls-update.ts
```

Output:
- Exit code 0 = No update needed
- Exit code 1 = New data available
- Exit code 2 = Error occurred

## Data Period Display

The current data period is displayed:
- In the footer: "Data: May 2024" badge
- Can be queried via: `SELECT * FROM data_metadata`

## BLS Release Schedule

BLS releases OEWS data annually:
- **Reference period:** May of each year
- **Release date:** ~10-11 months later (March-April)

| Data Period | Expected Release |
|-------------|-----------------|
| May 2024 | April 2025 ✓ |
| May 2025 | March-April 2026 |
| May 2026 | March-April 2027 |

## Troubleshooting

### Workflow not running?
- Check GitHub Actions is enabled for the repo
- Ensure secrets are configured correctly
- Check workflow file syntax

### Ingestion failing?
- Verify `DATABASE_URL` is correct (use pooler URL)
- Check Excel file format matches expected columns
- Run with `--dry-run` first to test

### Deploy failing?
- Verify `VERCEL_TOKEN` has correct permissions
- Check `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` match
