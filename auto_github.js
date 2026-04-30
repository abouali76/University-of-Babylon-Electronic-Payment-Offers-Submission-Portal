const puppeteer = require('puppeteer-core');

async function automateGitHub() {
  try {
    console.log('Connecting to browser...');
    const res = await fetch('http://127.0.0.1:9222/json/version');
    const version = await res.json();
    
    const browser = await puppeteer.connect({
      browserWSEndpoint: version.webSocketDebuggerUrl,
      defaultViewport: null
    });

    console.log('Opening new tab...');
    const page = await browser.newPage();
    
    // Go to create repo page
    await page.goto('https://github.com/new', { waitUntil: 'networkidle2' });
    
    // Type repo name
    const repoName = 'uob-payment-gate-' + Math.floor(Math.random() * 1000);
    await page.type('input[data-testid="repository-name-input"], input[aria-label="Repository"]', repoName);
    
    // Wait a bit for validation
    await new Promise(r => setTimeout(r, 2000));
    
    // Click create button
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
      console.log('Creating repository...');
      await createBtn.click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      
      console.log('Navigating to upload page...');
      // Now go to upload page
      await page.goto(page.url() + '/upload/main', { waitUntil: 'networkidle2' });
      
      // We are on the upload page. Let's show an alert to the user.
      await page.evaluate(() => {
        alert('لقد قمت بإنشاء المستودع لك! الآن يرجى سحب مجلد dist (أو ملفاته) وإفلاتها هنا في هذه الصفحة، ثم الضغط على Commit changes في الأسفل.');
      });
      
      console.log('Done.');
    } else {
      console.log('Could not find create button');
    }
    
    browser.disconnect();
  } catch (e) {
    console.error('Error:', e);
  }
}

automateGitHub();
