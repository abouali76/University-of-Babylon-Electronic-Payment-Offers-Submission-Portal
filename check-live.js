fetch('https://abouali76.github.io/University-of-Babylon-Electronic-Payment-Offers-Submission-Portal/')
  .then(r => r.text())
  .then(html => {
    const jsPaths = html.match(/assets\/index-[^\"]*\.js/g) || html.match(/assets\/index-[^\']*\.js/g);
    return Promise.all(jsPaths.map(p => fetch('https://abouali76.github.io/University-of-Babylon-Electronic-Payment-Offers-Submission-Portal/' + p).then(r => r.text())));
  })
  .then(texts => {
    console.log('Includes mapToDb:', texts.some(t => t.includes('mapToDb')));
  })
  .catch(console.error);
