const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function createRepoSilently() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    const browserWSEndpoint = version.webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null
    });

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('github.com'));
    
    if (!page) {
      console.log('GitHub not open in browser pages');
      process.exit(1);
    }
    
    // Inject JS to create repo via GitHub's internal API or fetch to /new
    const result = await page.evaluate(async () => {
      // Find the user token/authenticity_token from the page
      const form = document.querySelector('form[action="/repositories"]');
      let authenticity_token = '';
      if (form) {
        const tokenInput = form.querySelector('input[name="authenticity_token"]');
        if (tokenInput) authenticity_token = tokenInput.value;
      }

      if (!authenticity_token) {
        // Try fetching /new to get the token
        const htmlRes = await fetch('/new');
        const html = await htmlRes.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const tInput = doc.querySelector('form[action="/repositories"] input[name="authenticity_token"]');
        if (tInput) authenticity_token = tInput.value;
      }

      if (!authenticity_token) return 'Could not find token';

      const repoName = 'uob-payment-gate-' + Math.floor(Math.random() * 1000);

      const formData = new URLSearchParams();
      formData.append('authenticity_token', authenticity_token);
      formData.append('repository[name]', repoName);
      formData.append('repository[visibility]', 'public');
      formData.append('repository[auto_init]', '0');

      const response = await fetch('/repositories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml'
        },
        body: formData.toString()
      });

      return {
        url: response.url,
        repoName
      };
    });

    console.log('Result:', result);
    
    if (result && result.url && result.url.includes('github.com')) {
      const gitUrl = result.url + '.git';
      fs.writeFileSync('git_url.txt', gitUrl);
    }
    
    browser.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

createRepoSilently();
