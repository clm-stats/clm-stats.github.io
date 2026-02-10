const fs = require('fs');
const curr = fs.readFileSync('./dist/buildJekyll.js', 'utf-8');
const nex1 = curr.replaceAll('react/jsx-runtime', 'preact/jsx-runtime');
const nex2 = nex1.replaceAll('ppreact/jsx-runtime', 'preact/jsx-runtime');
fs.writeFileSync('./dist/buildJekyll.js', nex2);
