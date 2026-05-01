import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Use service role key if available, otherwise just use anon
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSubmissionsSchema() {
  const columnsToTest = ['status', 'evaluation_score', 'last_updated', 'document_path', 'data', 'auth_id', 'user_id'];
  for (const col of columnsToTest) {
    const { error } = await supabase.from('submissions').select(col).limit(1);
    if (error) console.log(`Column ${col} error:`, error.message);
    else console.log(`Column ${col} EXISTS`);
  }
}

checkSubmissionsSchema();
