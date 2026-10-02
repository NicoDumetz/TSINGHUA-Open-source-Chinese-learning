import { readFile } from 'node:fs/promises';
const site = new URL(process.env.SITE_URL || '');
if (!['https:', 'http:'].includes(site.protocol) || site.username || site.password) throw new Error('SITE_URL must be an HTTP(S) public URL');
if (!site.pathname.endsWith('/')) site.pathname += '/';
const localHtml = await readFile('dist/index.html', 'utf8');
const sources = JSON.parse(await readFile('dist/audio/sources.json', 'utf8'));
const files = ['index.html', ...[...localHtml.matchAll(/(?:src|href)="(\.\/assets\/[^"?#]+)"/g)].map(m=>m[1]), ...Object.values(sources.clips).map(name=>`audio/${name}`), 'strokes/你.json'];
for (const file of files) {
  const url = new URL(file, site);
  let valid = false;
  for (let attempt=0; attempt<3 && !valid; attempt++) {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), cache:'no-store' });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const expected = await readFile(new URL(`../dist/${file}`, import.meta.url));
    valid = response.ok && Buffer.from(bytes).equals(expected);
    if (!valid && attempt<2) await new Promise(resolve=>setTimeout(resolve,2000));
  }
  if (!valid) throw new Error(`Public file missing or outdated: ${file}`);
}
console.log(`Public deployment verified: ${files.length} files (HTML, JS/CSS, Mandarin audio and stroke data).`);
