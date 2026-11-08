import { readdir, readFile, writeFile, cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { validateAll } from './validate-data.mjs';

validateAll();

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
const [header, explorer] = await Promise.all(
  ['site-header.html', 'property-explorer.html'].map(name => readFile(path.join(root, 'includes', name), 'utf8'))
);
const sections = {
  'index.html': 'home',
  'property-map.html': 'map',
  'data-sources.html': 'sources',
  'methodology.html': 'sources',
  'gachibowli.html': 'areas',
  'kondapur.html': 'areas',
  'financial-district.html': 'areas',
};
const detailPages = ['methodology.html', 'gachibowli.html', 'kondapur.html', 'financial-district.html'];
const scripts = ['script.js', 'raven.js', 'contact.js', 'citizen-guide.js', 'site-navigation.js'];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const name = entry.name;
  const source = path.join(root, name);
  const destination = path.join(out, name);
  if (name.endsWith('.html')) {
    const section = sections[name] ?? path.basename(name, '.html');
    const current = detailPages.includes(name) ? 'location' : 'page';
    let pageHeader = header.replace(`data-nav="${section}"`, `data-nav="${section}" aria-current="${current}"`);
    if (section === 'home') pageHeader = pageHeader.replace('index.html#guides', '#guides');
    if (section === 'map') pageHeader = pageHeader.replace('property-map.html#community', '#community');
    const html = await readFile(source, 'utf8');
    await writeFile(destination, html.replace('<!-- site-header -->', () => pageHeader)
      .replace('<!-- property-explorer -->', () => explorer));
  } else if (/\.(css|svg)$/.test(name) || scripts.includes(name)) {
    await cp(source, destination);
  }
}
for (const name of ['data', 'images', 'vendor']) {
  await cp(path.join(root, name), path.join(out, name), { recursive: true });
}

console.log('Raven built into dist; server source, tests, and setup files excluded.');
