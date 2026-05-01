import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log("Logging in as company '1'...");
  const { data: auth, error: loginError } = await supabase.auth.signInWithPassword({
    email: '1@uob.local',
    password: '100000'
  });

  if (loginError) {
    console.error("Login failed:", loginError.message);
    return;
  }
  console.log("Login successful. UID:", auth.user.id);

  const testFile = Buffer.from('test pdf content');
  const fileName = `test_${Date.now()}.pdf`;

  console.log(`Uploading ${fileName}...`);
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${auth.user.id}/${fileName}`, testFile, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (error) {
    console.error("UPLOAD FAILED:", error);
  } else {
    console.log("UPLOAD SUCCESSFUL:", data);
  }
}

testUpload();
