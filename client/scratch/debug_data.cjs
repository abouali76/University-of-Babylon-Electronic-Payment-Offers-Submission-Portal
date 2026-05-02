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
  
  const { data: subs, error } = await supabase
    .from('submissions')
    .select('*');

  if (error) { console.error(error); return; }

  const hussain = subs.find(s => s.data && s.data.representativeName === 'حسين محمد فاضل');
  
  if (hussain) {
      console.log('--- HUSSAIN FULL DATA ---');
      console.log(JSON.stringify(hussain.data, null, 2));
  } else {
      console.log('Hussain not found in any submission');
  }
}

debug();
