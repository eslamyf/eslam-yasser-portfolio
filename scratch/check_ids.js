const fs = require('fs');
const path = require('path');

const adminHtml = fs.readFileSync('client/admin.html', 'utf8');
const adminJs = fs.readFileSync('client/assets/js/admin.js', 'utf8');

// Regex for document.getElementById('xxx') or document.getElementById("xxx")
const regex = /document\.getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const jsIds = new Set();
while ((match = regex.exec(adminJs)) !== null) {
  jsIds.add(match[1]);
}

console.log('Total IDs found in admin.js:', jsIds.size);

const missing = [];
for (const id of jsIds) {
  if (!adminHtml.includes(`id="${id}"`) && !adminHtml.includes(`id='${id}'`)) {
    missing.push(id);
  }
}

console.log('Missing IDs in admin.html:', missing);
