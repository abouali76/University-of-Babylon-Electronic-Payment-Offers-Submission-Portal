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
  
  const { data, error } = await supabase.from('users').select('*').limit(1);
  console.log('Users columns:', Object.keys(data[0] || {}));

  const { data: sData } = await supabase.from('submissions').select('*').limit(1);
  console.log('Submissions columns:', Object.keys(sData[0] || {}));
}

debug();
