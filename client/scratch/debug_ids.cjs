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
  
  // Search for 'حسين' in submissions
  const { data: s1 } = await supabase.from('submissions').select('*');
  console.log('Total submissions:', s1 ? s1.length : 0);

  // Search in 'users'
  const { data: u1 } = await supabase.from('users').select('*');
  console.log('Total users:', u1 ? u1.length : 0);
  console.log('Usernames:', u1 ? u1.map(u => u.username) : []);
}

debug();
