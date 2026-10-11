// Перегенерирует блок карточек в index.html из assets/js/works.js
import { readFileSync, writeFileSync } from 'node:fs';
import { WORKS, worksHtml } from '../assets/js/works.js';

const file = new URL('../index.html', import.meta.url);
const html = readFileSync(file, 'utf8');
const next = html.replace(
  /<!-- works:start -->[\s\S]*?<!-- works:end -->/,
  `<!-- works:start -->\n${worksHtml(WORKS)}\n          <!-- works:end -->`,
);
if (next === html) console.log('works block already up to date');
else {
  writeFileSync(file, next);
  console.log('works block updated');
}
