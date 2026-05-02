const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function debug() {
  const supabaseUrl = 'https://elnixrgjmmxosshtuqha.supabase.co';
  let key = '';
  try {
      const env = fs.readFileSync('client/.env', 'utf8');
      key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
  } catch(e) {}

  const supabase = createClient(supabaseUrl, key);
  
  // Try to read as a service role or check policies
  // Since I don't have service key, I'll try to see if I can get anything from 'submissions'
  const { data, error } = await supabase.from('submissions').select('*');
  console.log('Error:', error);
  console.log('Data count:', data ? data.length : 0);
}

debug();
