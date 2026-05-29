-- 1. Create evaluation_criteria table
CREATE TABLE IF NOT EXISTS evaluation_criteria (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    category TEXT, -- e.g., 'Technical', 'Financial'
    weight NUMERIC(5,2) DEFAULT 1.0, -- Relative importance
    is_mandatory BOOLEAN DEFAULT FALSE, -- If true and rejected, company is disqualified
    options_scores JSONB DEFAULT '{"accept": 100, "provide": 50, "reject": 0}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    display_order INTEGER DEFAULT 0
);

-- 2. Create company_answers table
CREATE TABLE IF NOT EXISTS company_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    criterion_id UUID REFERENCES evaluation_criteria(id) ON DELETE CASCADE,
    answer_value TEXT NOT NULL, -- 'accept', 'provide', 'reject'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(submission_id, criterion_id)
);

-- 3. Add auto-evaluation columns to submissions
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pf_columns('submissions', 'auto_score')) THEN
        ALTER TABLE submissions ADD COLUMN auto_score NUMERIC(5,2) DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pf_columns('submissions', 'auto_ranking')) THEN
        ALTER TABLE submissions ADD COLUMN auto_ranking INTEGER;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_columns('submissions', 'auto_rejection_reason')) THEN
        ALTER TABLE submissions ADD COLUMN auto_rejection_reason TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pf_columns('submissions', 'evaluation_details')) THEN
        ALTER TABLE submissions ADD COLUMN evaluation_details JSONB;
    END IF;
END $$;

-- Helper function to check column existence if needed (Supabase/Postgres)
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_score NUMERIC(5,2) DEFAULT 0;
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_ranking INTEGER;
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS auto_rejection_reason TEXT;
-- ALTER TABLE submissions ADD COLUMN IF NOT EXISTS evaluation_details JSONB;

-- Enable RLS for new tables
ALTER TABLE evaluation_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read" ON evaluation_criteria FOR SELECT USING (true);
CREATE POLICY "Admin All" ON evaluation_criteria FOR ALL USING (true);
CREATE POLICY "Public All" ON company_answers FOR ALL USING (true);
