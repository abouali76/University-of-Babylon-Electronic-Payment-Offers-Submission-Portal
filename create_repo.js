const puppeteer = require('puppeteer-core');
const fs = require('fs');

async function createRepo() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    const browserWSEndpoint = version.webSocketDebuggerUrl;

    const browser = await puppeteer.connect({
      browserWSEndpoint,
      defaultViewport: null
    });

    // Find github page
    const targets = await browser.targets();
    const githubTarget = targets.find(t => t.url().includes('github.com'));
    
    let page;
    if (githubTarget) {
      page = await githubTarget.page();
    }
    
    if (!page) {
      const pages = await browser.pages();
      page = pages[0];
      if (!page) {
        page = await browser.newPage();
      }
    }

    if (!page.url().includes('/new')) {
      await page.goto('https://github.com/new');
    }

    await page.waitForSelector('input[aria-label="Repository"]', { timeout: 10000 });
    
    // Type repo name
    const repoName = 'epcs';
    await page.type('input[aria-label="Repository"]', repoName);
    
    await new Promise(r => setTimeout(r, 2000));
    
    // Find create button
    const buttons = await page.$$('button');
    let createBtn = null;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text && text.toLowerCase().includes('create repository')) {
        createBtn = btn;
        break;
      }
    }
    
    if (createBtn) {
      await createBtn.click();
      await page.waitForNavigation({ timeout: 15000 });
      
      const newUrl = page.url();
      const gitUrl = newUrl + '.git';
      fs.writeFileSync('git_url.txt', gitUrl);
      console.log('Repo created:', gitUrl);
    } else {
      console.log('Could not find create button');
    }
    
    browser.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

createRepo();
