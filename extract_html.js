const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function extractHtml() {
  let browser;
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    
    browser = await puppeteer.connect({
      browserWSEndpoint: version.webSocketDebuggerUrl,
      defaultViewport: null
    });

    const page = await browser.newPage();
    const projectUrl = 'https://supabase.com/dashboard/project/elnixrgjmmxosshtuqha/settings/api';
    await page.goto(projectUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait an extra 5 seconds for React to render
    await new Promise(r => setTimeout(r, 5000));
    
    const html = await page.content();
    fs.writeFileSync('supabase_api_page.html', html);
    console.log('HTML saved.');
    
    await page.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    if (browser) browser.disconnect();
  }
}

extractHtml();
