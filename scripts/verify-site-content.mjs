import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const app = read('src/App.tsx');
const css = read('src/index.css');
const data = read('src/data.ts');
const readme = read('README.md');
const html = read('index.html');

assert.ok(existsSync(join(root, '.impeccable.md')), 'missing .impeccable.md design context');
assert.ok(existsSync(join(root, 'assets/QR1.png')), 'missing converted payment QR image');
assert.ok(existsSync(join(root, 'assets/Shop_GoogleQR.png')), 'missing converted Google review QR image');

assert.match(app, /assets\/logo\.jpeg/, 'logo asset is not used in the app');
assert.match(app, /assets\/QR1\.png/, 'payment QR png is not used in the app');
assert.match(app, /assets\/Shop_GoogleQR\.png/, 'Google review QR png is not used in the app');
assert.match(app, /siteData\.googleProfileUrl/, 'Google profile link should be exposed near the QR');
assert.match(app, /<main\b/, 'page must expose a main landmark');
assert.match(app, /aria-expanded=/, 'FAQ buttons need aria-expanded');
assert.match(app, /questionBengali/, 'FAQ section should render Bengali question text');
assert.match(app, /answerBengali/, 'FAQ section should render Bengali answer text');
assert.match(app, /title="Bikash Chicken Point location map"/, 'map iframe needs a descriptive title');
assert.match(app, /Pay after we confirm your order/i, 'payment flow must say to pay after confirmation');
assert.match(app, /today.s rate/i, 'menu CTAs must ask for today rates');
assert.doesNotMatch(app, /Trusted by 500\+ locals|Loved by the Community/, 'remove unverifiable trust/testimonial claims');

assert.match(data, /Curry cut/i, 'revised menu should include curry cut');
assert.match(data, /Sabji Market, Fuljhore, Durgapur-713206, West Bengal/, 'address should match the public listing');
assert.match(data, /endHour:\s*21/, 'closing hour should match 9:00 PM listing');
assert.match(data, /googleProfileUrl:\s*["']https:\/\/share\.google\/B1iUixv7uA7BVarqb["']/, 'Google profile URL should use the provided share link');
assert.match(data, /Whole chicken/i, 'revised menu should include whole chicken');
assert.match(data, /Liver|Gizzard/i, 'revised menu should include liver/gizzard');
assert.match(data, /questionBengali/i, 'FAQ data should include Bengali questions');
assert.match(data, /answerBengali/i, 'FAQ data should include Bengali answers');
assert.doesNotMatch(data, /price:\s*["']₹/, 'menu data should not expose fixed rupee prices');

assert.match(css, /Anek Bangla/, 'heading font should use Anek Bangla');
assert.match(css, /Hind Siliguri/, 'body font should use Hind Siliguri');
assert.match(css, /object-fit:\s*contain/, 'Google QR should be displayed fully, not cropped');
assert.match(css, /oklch\(/, 'visual tokens should use OKLCH colors');
assert.match(css, /prefers-color-scheme:\s*dark/, 'CSS should include dark mode support');
assert.match(css, /prefers-reduced-motion/, 'CSS should include reduced-motion handling');

assert.match(readme, /Bikash Chicken Point/, 'README should describe the storefront');
assert.doesNotMatch(readme, /AI Studio/i, 'README should not describe a generic AI Studio app');
assert.match(html, /og:title/, 'index.html should include Open Graph title metadata');

console.log('Site content contract passed.');
