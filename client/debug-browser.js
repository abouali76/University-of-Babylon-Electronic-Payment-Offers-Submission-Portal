import puppeteer from 'puppeteer-core';
import fetch from 'node-fetch';

async function debugBrowser() {
  let browser;
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    const browserWSEndpoint = version.webSocketDebuggerUrl;

    browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null
    });

    const page = await browser.newPage();
    page.on('response', async response => {
      const status = response.status();
      if (status >= 400 && response.url().includes('supabase.co/rest/v1')) {
        console.log('API ERROR:', status, response.url());
        try {
          const body = await response.text();
          console.log('RESPONSE BODY:', body);
        } catch (e) {}
      }
    });

    console.log('Navigating to site...');
    await page.goto('https://abouali76.github.io/University-of-Babylon-Electronic-Payment-Offers-Submission-Portal/?v=debug456', { waitUntil: 'networkidle2' });

    console.log('Logging in as admin...');
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      if (inputs.length >= 2) {
        inputs[0].value = 'admin';
        inputs[1].value = 'admin123';
        // Dispatch events to trigger React state updates
        inputs[0].dispatchEvent(new Event('input', { bubbles: true }));
        inputs[1].dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('تسجيل الدخول'));
      if (btn) btn.click();
    });

    console.log('Waiting for navigation to admin...');
    await new Promise(r => setTimeout(r, 5000));

    console.log('Done waiting. Check the logs above.');
    await page.close();
  } catch (e) {
    console.error('Error:', e);
  } finally {
    if (browser) browser.disconnect();
  }
}
debugBrowser();
