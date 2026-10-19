// Looks for new news mentions of Alessandro Mannino and adds them to press.json.
// Run weekly by .github/workflows/press.yml, which opens a pull request for review
// so nothing reaches the live site until you approve it.
//
// To hide a result for good, move its URL into "ignored" in press.json.
// Run locally with: node scripts/find-press.mjs

import { readFile, writeFile } from 'node:fs/promises';

const NAME = 'Alessandro Mannino';
const QUERIES = [`"${NAME}"`, `"${NAME}" Bumper`];
const FILE = new URL('../press.json', import.meta.url);

const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
const tag = (xml, name) => decode((xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)) || [])[1] || '');
const normalize = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/[?#].*$/, '').replace(/\/$/, '');

async function search(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await fetch(url, { headers: { 'User-Agent': 'alessandromannino.com press finder' } });
  if (!res.ok) throw new Error(`Google News returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item]) => {
    const outlet = tag(item, 'source');
    let title = tag(item, 'title');
    if (outlet && title.endsWith(` - ${outlet}`)) title = title.slice(0, -(outlet.length + 3));
    return {
      title,
      outlet: outlet || 'News',
      date: new Date(tag(item, 'pubDate')).toISOString().slice(0, 10),
      url: tag(item, 'link'),
      kind: 'Mention',
    };
  });
}

const press = JSON.parse(await readFile(FILE, 'utf8'));
press.ignored ??= [];
const known = new Set([
  ...press.mentions.map((m) => normalize(m.url)),
  ...press.mentions.map((m) => m.title.toLowerCase()),
  ...(press.bylines?.articles || []).map((a) => a.title.toLowerCase()),
  ...press.ignored.map(normalize),
]);

const found = [];
for (const q of QUERIES) {
  for (const item of await search(q)) {
    if (known.has(normalize(item.url)) || known.has(item.title.toLowerCase())) continue;
    known.add(normalize(item.url));
    known.add(item.title.toLowerCase());
    found.push(item);
  }
}

if (found.length) {
  press.mentions.push(...found);
  await writeFile(FILE, JSON.stringify(press, null, 2) + '\n');
}
console.log(found.length ? `Added ${found.length} new mention(s):\n${found.map((f) => `- ${f.title} (${f.outlet})`).join('\n')}` : 'No new mentions.');
