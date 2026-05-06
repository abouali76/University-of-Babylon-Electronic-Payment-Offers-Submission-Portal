fetch('https://abouali76.github.io/epcs/')
  .then(r => r.text())
  .then(html => {
    const jsPaths = html.match(/assets\/index-[^\"]*\.js/g) || html.match(/assets\/index-[^\']*\.js/g);
    return Promise.all(jsPaths.map(p => fetch('https://abouali76.github.io/epcs/' + p).then(r => r.text())));
  })
  .then(texts => {
    console.log('Includes mapToDb:', texts.some(t => t.includes('mapToDb')));
  })
  .catch(console.error);
