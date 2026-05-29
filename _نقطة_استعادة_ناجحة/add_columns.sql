-- إضافة الأعمدة الجديدة لجدول submissions
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3a_2_techspecs TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3a_3_appsupport TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3a_5_reporting TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3a_6_training TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_2_encryption TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_6_pentest TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_7_monitoring TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q3b_8_incident TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_2_penaltyclause TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_4_exitclause TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_5_liability TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_7_auditright TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_9_renewal TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_2_innovation TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_3_scholarships TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_4_stafftraining TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_5_mobileapp TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_6_foreignstudents TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_7_complaints TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q5_8_socialresp TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS q4_10_blacklist TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS document_url TEXT;

-- تعديل نوع عمود التقييم لدعم الكسور (مثلاً 8.5)
ALTER TABLE submissions ALTER COLUMN evaluation_score TYPE NUMERIC(4,2);
