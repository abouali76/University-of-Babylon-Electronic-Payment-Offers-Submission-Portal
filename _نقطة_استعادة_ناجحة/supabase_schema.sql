-- 1. Create Users Table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'company',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Submissions Table
CREATE TABLE submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    "companyName" TEXT,
    "submissionDate" DATE,
    "representativeName" TEXT,
    phone TEXT,
    email TEXT,
    "centralBankLicense" TEXT,
    "marketExperience" TEXT,
    "govInstitutionsCount" TEXT,
    "paidCapital" TEXT,
    "officialAddress" TEXT,
    q2_1_settlement TEXT,
    "q2_2_commissions" TEXT,
    q2_3_intermediary TEXT,
    "q2_4_delayPenalty" TEXT,
    "q2_5_atmCommitment" TEXT,
    "q2_6_studentCards" TEXT,
    "q2_7_chargingCenters" TEXT,
    "q2_8_posCommitment" TEXT,
    "q3a_1_integratedSystem" TEXT,
    "q3a_4_webIntegration" TEXT,
    "q3b_1_certificates" TEXT,
    q3b_3_rto_bcp TEXT,
    q3b_4_backups TEXT,
    "q3b_5_supportSla" TEXT,
    "q4_1_bankGuarantee" TEXT,
    "q4_3_dataOwnership" TEXT,
    q4_6_jurisdiction TEXT,
    "q4_8_contractDuration" TEXT,
    q4_9_renewal TEXT,
    q4_10_blacklist TEXT,
    "q5_1_extraFeatures" TEXT,
    "additionalNotes" TEXT,
    "signedBy" TEXT,
    position TEXT,
    "lastUpdated" TIMESTAMPTZ DEFAULT NOW(),
    evaluation_score NUMERIC(4,2) DEFAULT 0,
    status TEXT DEFAULT 'draft' -- 'draft' or 'final'
);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Create Policies (Example: Allow anyone with the anon key to read/write for now)
-- You can tighten these policies later for better security.
CREATE POLICY "Public Read/Write" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Read/Write" ON submissions FOR ALL USING (true) WITH CHECK (true);
