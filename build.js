const fs = require('fs');
const path = require('path');

const root = __dirname;
const out = path.join(root, 'dist');
const site = JSON.parse(fs.readFileSync(path.join(root, 'data/site.json'), 'utf8'));

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

function copy(src, dest) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dest, f));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const escAttr = s => String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const replaceMeta = (name, value, property = false) => {
  const key = property ? 'property' : 'name';
  const re = new RegExp(`<meta ${key}="${name}" content="[^"]*"\\s*/?>`, 'i');
  const tag = `<meta ${key}="${name}" content="${escAttr(value)}" />`;
  html = re.test(html) ? html.replace(re, tag) : html.replace('</head>', `  ${tag}\n</head>`);
};
html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escAttr(site.seo.title)}</title>`);
replaceMeta('description', site.seo.description);
replaceMeta('og:title', site.seo.title, true);
replaceMeta('og:description', site.seo.description, true);
html = html.replace(/<link rel="canonical" href="[^"]*"\s*\/>/i, `<link rel="canonical" href="${escAttr(site.seo.canonical)}" />`);

const dayMap = {
  monday:'Monday', tuesday:'Tuesday', wednesday:'Wednesday', thursday:'Thursday',
  friday:'Friday', saturday:'Saturday', sunday:'Sunday'
};
const openingHoursSpecification = [];
for (const [key, dayOfWeek] of Object.entries(dayMap)) {
  const v = site.openingHours[key];
  const m = typeof v === 'string' && v.match(/^(\d{2}:\d{2})[–-](\d{2}:\d{2})$/);
  if (m) openingHoursSpecification.push({ '@type':'OpeningHoursSpecification', dayOfWeek, opens:m[1], closes:m[2] });
}
const schema = {
  '@context':'https://schema.org',
  '@type':'HealthAndBeautyBusiness',
  name:site.name,
  url:site.seo.canonical,
  telephone:site.phone,
  address:{
    '@type':'PostalAddress', streetAddress:site.address.street, postalCode:site.address.postalCode,
    addressLocality:site.address.city, addressCountry:site.address.country
  },
  aggregateRating:{ '@type':'AggregateRating', ratingValue:String(site.reviews.googleRating), reviewCount:String(site.reviews.googleCount) },
  openingHoursSpecification
};
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i, `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`);
fs.writeFileSync(path.join(out, 'index.html'), html);

for (const f of ['styles.css','app.js']) copy(path.join(root,f), path.join(out,f));
copy(path.join(root,'data'), path.join(out,'data'));
if (fs.existsSync(path.join(root,'assets'))) copy(path.join(root,'assets'), path.join(out,'assets'));

const canonical = site.seo.canonical.replace(/\/$/, '');
fs.writeFileSync(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${canonical}/sitemap.xml\n`);
fs.writeFileSync(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${canonical}/</loc></url>\n</urlset>\n`);
console.log(`Built Thai Smile to ${out}`);
