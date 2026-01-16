-- Data metadata table for tracking data version and update status
-- Run this once in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS data_metadata (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data_period VARCHAR(20) NOT NULL,           -- e.g., "May 2024"
    bls_release_date DATE,                       -- When BLS published this data
    last_ingested_at TIMESTAMPTZ DEFAULT NOW(), -- When we imported it
    last_checked_at TIMESTAMPTZ DEFAULT NOW(),  -- Last time we checked for updates
    record_count INTEGER,                        -- Number of salary records
    source_url TEXT,                             -- BLS download URL used
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial row with current data
INSERT INTO data_metadata (data_period, bls_release_date, record_count, source_url)
VALUES (
    'May 2024',
    '2025-04-02',
    141164,
    'https://www.bls.gov/oes/special.requests/oesm24ma.zip'
)
ON CONFLICT (id) DO UPDATE SET
    data_period = EXCLUDED.data_period,
    bls_release_date = EXCLUDED.bls_release_date,
    record_count = EXCLUDED.record_count,
    source_url = EXCLUDED.source_url,
    last_ingested_at = NOW();

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_data_metadata_period ON data_metadata(data_period);
