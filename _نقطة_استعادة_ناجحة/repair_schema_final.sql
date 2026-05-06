-- SQL Repair Comprehensive Final
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_1_extrafeatures TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_2_innovation TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_3_scholarships TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_4_stafftraining TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_5_posupdates TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_6_foreignpayments TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_7_complaints TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_8_socialresp TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_1_certificates TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_2_encryption TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_5_supportsla TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_6_pentest TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_7_monitoring TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_8_incident TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_10_blacklist TEXT;

-- Reset RLS
DROP POLICY IF EXISTS "Allow All Operations" ON submissions;
CREATE POLICY "Allow All Operations" ON submissions FOR ALL TO public USING (true) WITH CHECK (true);

-- Refresh Cache
NOTIFY pgrst, 'reload schema';
