const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function extractKey() {
  let browser;
  try {
    console.log('Connecting to browser...');
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    
    browser = await puppeteer.connect({
      browserWSEndpoint: version.webSocketDebuggerUrl,
      defaultViewport: null
    });

    console.log('Opening new tab...');
    const page = await browser.newPage();
    
    const projectUrl = 'https://supabase.com/dashboard/project/elnixrgjmmxosshtuqha/settings/api';
    console.log('Navigating to', projectUrl);
    await page.goto(projectUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for the API keys section to load
    await page.waitForSelector('input[value^="eyJ"]', { timeout: 15000 });
    
    // Find the anon key
    // In Supabase dashboard, the anon key is usually the first JWT-looking input or has 'anon' label nearby.
    const keys = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[value^="eyJ"]'));
      const anonInput = inputs.find(el => el.value && el.value.startsWith('eyJ') && el.closest('.border') && el.closest('.border').textContent.includes('anon'));
      
      // If we can't find it strictly by 'anon', just grab the first one that looks like a JWT
      if (anonInput) return anonInput.value;
      const anyJwt = inputs.find(el => el.value && el.value.startsWith('eyJ'));
      return anyJwt ? anyJwt.value : null;
    });

    if (keys) {
      console.log('Successfully found the Anon Key!');
      
      const envPath = path.join(__dirname, 'client', '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      envContent = envContent.replace(/VITE_SUPABASE_ANON_KEY=.*/g, `VITE_SUPABASE_ANON_KEY=${keys}`);
      fs.writeFileSync(envPath, envContent);
      console.log('.env updated successfully.');
    } else {
      console.log('Could not find the API key on the page.');
    }
    
    await page.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    if (browser) browser.disconnect();
  }
}

extractKey();
