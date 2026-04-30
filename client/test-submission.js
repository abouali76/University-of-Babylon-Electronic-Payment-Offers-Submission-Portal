import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Submission Insert...');
  
  // First ensure there is a user
  await supabase.from('users').upsert({ username: 'testcompany', password: '123', name: 'Test', role: 'company' });

  const formData = {
    username: 'testcompany',
    status: 'final',
    evaluation_score: 0,
    companyName: 'Test',
    submissionDate: new Date().toISOString().split('T')[0],
    representativeName: 'Test',
    phone: '123',
    email: 'test@test.com',
    centralBankLicense: '123',
    marketExperience: '123',
    govInstitutionsCount: '123',
    paidCapital: '123',
    officialAddress: '123',
    q2_1_settlement: '1',
    q2_2_commissions: '2',
    q2_3_intermediary: '3',
    q2_4_delayPenalty: '4',
    q2_5_atmCommitment: '5',
    q2_6_studentCards: '6',
    q2_7_chargingCenters: '7',
    q2_8_posCommitment: '8',
    q3a_1_integratedSystem: '1',
    q3a_4_webIntegration: '2',
    q3b_1_certificates: '1',
    q3b_3_rto_bcp: '2',
    q3b_4_backups: '3',
    q3b_5_supportSla: '4',
    q4_1_bankGuarantee: '1',
    q4_3_dataOwnership: '2',
    q4_6_jurisdiction: '3',
    q4_8_contractDuration: '4',
    q5_1_extraFeatures: '1',
    additionalNotes: '1',
    signedBy: '1',
    position: '1'
  };

  const mapToDb = (data) => {
    const map = {
      documentUrl: 'document_url'
    };
    const result = {};
    for (const key in data) {
      const dbKey = map[key] || key.toLowerCase();
      result[dbKey] = data[key];
    }
    return result;
  };

  const { data, error } = await supabase
    .from('submissions')
    .upsert([mapToDb(formData)]);
    
  console.log('Insert Result:', { data, error });
}

test();
