const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

async function extractKey() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    const browserWSEndpoint = version.webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null
    });

    const page = await browser.newPage();
    await page.goto('https://supabase.com/dashboard/project/elnixrgjmmxosshtuqha/settings/api', { waitUntil: 'networkidle2' });
    await page.waitForSelector('input[value^="eyJ"]', { timeout: 15000 });
    
    // Find the keys
    const keys = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[value^="eyJ"]'));
      
      const anonInput = inputs.find(el => {
        const parent = el.closest('.border') || el.parentElement;
        return el.value && el.value.startsWith('eyJ') && parent && parent.textContent.toLowerCase().includes('anon');
      });
      
      const serviceInput = inputs.find(el => {
        const parent = el.closest('.border') || el.parentElement;
        return el.value && el.value.startsWith('eyJ') && parent && parent.textContent.toLowerCase().includes('service_role');
      });
      
      return {
        anon: anonInput ? anonInput.value : null,
        service: serviceInput ? serviceInput.value : null
      };
    });

    if (keys.anon || keys.service) {
      console.log('Successfully found keys:', { anon: !!keys.anon, service: !!keys.service });
      
      const envPath = path.join(__dirname, 'client', '.env');
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      if (keys.anon) {
        if (envContent.includes('VITE_SUPABASE_ANON_KEY=')) {
          envContent = envContent.replace(/VITE_SUPABASE_ANON_KEY=.*/g, `VITE_SUPABASE_ANON_KEY=${keys.anon}`);
        } else {
          envContent += `\nVITE_SUPABASE_ANON_KEY=${keys.anon}`;
        }
      }
      
      if (keys.service) {
        console.log('SERVICE_ROLE_KEY found. Need this for Edge Function secrets.');
        const rootEnvPath = path.join(__dirname, '.env');
        let rootEnv = fs.existsSync(rootEnvPath) ? fs.readFileSync(rootEnvPath, 'utf8') : '';
        if (rootEnv.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
          rootEnv = rootEnv.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/g, `SUPABASE_SERVICE_ROLE_KEY=${keys.service}`);
        } else {
          rootEnv += `\nSUPABASE_SERVICE_ROLE_KEY=${keys.service}`;
        }
        fs.writeFileSync(rootEnvPath, rootEnv);
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('Environment files updated successfully.');
    } else {
      console.log('Could not find the API keys on the page.');
    }
    
    await page.close();
    browser.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}
extractKey();
