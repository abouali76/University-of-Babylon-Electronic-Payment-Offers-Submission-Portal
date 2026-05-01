import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking submissions table structure...');
  
  // Get one record to check columns
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching submissions:', error);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('Columns in submissions:', Object.keys(data[0]));
  } else {
    // If no records, try to get from another table or just list what we can
    console.log('No records in submissions table. Cannot infer schema from data.');
    
    // Attempting to use rpc if it exists, though usually it doesn't for schema
    // Alternative: Try to select a non-existent column to see error message with available columns?
    // Or just check 'users' table columns
    const { data: userData } = await supabase.from('users').select('*').limit(1);
    if (userData && userData.length > 0) {
        console.log('Columns in users:', Object.keys(userData[0]));
    }
  }
}

checkSchema();
