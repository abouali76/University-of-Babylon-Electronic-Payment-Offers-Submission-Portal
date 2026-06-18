-- Create Submissions Round 2 Table
CREATE TABLE submissions_round2 (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT REFERENCES users(username) ON DELETE CASCADE,
    "companyName" TEXT,
    "submissionDate" DATE,
    "representativeName" TEXT,
    phone TEXT,
    email TEXT,
    "centralBankLicense" TEXT,
    "officialAddress" TEXT,
    
    -- Part 2: Operational and Financial
    "q2_1_deposit_within_short_period" TEXT,
    "q2_2_process_end_of_month_payments" TEXT,
    "q2_3_guarantee_movements_in_rashid" TEXT,
    "q2_4_commissions_and_discounts" TEXT,
    "q2_5_provide_atms_in_university" TEXT,
    "q2_6_student_cards_free_or_cheap" TEXT,
    "q2_7_charging_centers_in_university" TEXT,
    "q2_8_pos_maintenance_and_free_supplies" TEXT,
    "q2_9_laptop_and_printer" TEXT,
    "q2_10_partnership_with_rashid" TEXT,
    
    -- Part 3A: Electronic System
    "q3_1_integrated_system" TEXT,
    "q3_2_safe_link_payment" TEXT,
    "q3_3_iban_available" TEXT,

    -- Part 3B: Cyber Security
    "q4_1_confidentiality" TEXT,
    "q4_2_backups" TEXT,
    "q4_3_technical_support" TEXT,

    -- Part 4: Legal and Contractual
    "q5_1_data_ownership" TEXT,
    "q5_2_free_training" TEXT,
    "q5_3_contract_duration" TEXT,
    "q5_4_partial_updates" TEXT,
    "q5_5_contract_termination_and_fines" TEXT,

    -- Part 5: Additional
    "q6_1_sponsor_support" TEXT,

    -- Notes
    "additionalNotes" TEXT,

    -- Signatures
    "signedBy" TEXT,
    position TEXT,
    "document_url" TEXT,
    "last_updated" TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'draft',
    is_received BOOLEAN DEFAULT false
);

ALTER TABLE submissions_round2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read/Write Round 2" ON submissions_round2 FOR ALL USING (true) WITH CHECK (true);
