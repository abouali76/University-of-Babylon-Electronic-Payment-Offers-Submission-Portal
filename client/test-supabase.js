import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseKey ? supabaseKey.length : 0);
  
  // Try to select
  const { data: selectData, error: selectError } = await supabase.from('users').select('*');
  console.log('Select Result:', { data: selectData, error: selectError });

  // Try to insert
  const { data: insertData, error: insertError } = await supabase.from('users').insert([{
    username: 'test_user_node',
    password: 'password123',
    role: 'company'
  }]);
  console.log('Insert Result:', { data: insertData, error: insertError });
}

test();
