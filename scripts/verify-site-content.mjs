import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), 'utf8');

const app = read('src/App.tsx');
const css = read('src/index.css');
const data = read('src/data.ts');
const appSource = `${app}\n${data}`;
const readme = read('README.md');
const html = read('index.html');

assert.ok(existsSync(join(root, 'PRODUCT.md')), 'missing PRODUCT.md design context');
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
assert.match(appSource, /Pre-Book for Pickup/i, 'menu CTAs must support pickup pre-booking');
assert.match(appSource, /Online Pre-Bookings: Pick up in 2 mins\./, 'fast track pickup badge must be visible');
assert.match(appSource, /অনলাইন বুকিং: ২ মিনিটে পিকআপ/, 'fast track pickup badge must include Bengali text');
assert.match(appSource, /Request GST\/Formal Invoice/, 'booking flow must include formal invoice request toggle');
assert.match(appSource, /UDYAM-I-WB-23-8437469/, 'B2B trust section must show the UDYAM number');
assert.match(appSource, /Loyalty Check/i, 'storefront must include loyalty lookup');
assert.match(app, /\/admin/, 'app must include the hidden admin route');
assert.match(app, /signInWithPassword/, 'admin route must use Supabase email/password auth');
assert.match(app, /get_loyalty_by_phone/, 'loyalty lookup must use the Supabase RPC');
assert.doesNotMatch(app, /delivery/i, 'walk-in-only app copy must not mention delivery');
assert.doesNotMatch(app, /Trusted by 500\+ locals|Loved by the Community/, 'remove unverifiable trust/testimonial claims');

assert.match(data, /Curry cut/i, 'revised menu should include curry cut');
assert.match(data, /Sabji Market, Fuljhore, Durgapur-713206, West Bengal/, 'address should match the public listing');
assert.match(data, /endHour:\s*21/, 'closing hour should match 9:00 PM listing');
assert.match(data, /googleProfileUrl:\s*["']https:\/\/share\.google\/B1iUixv7uA7BVarqb["']/, 'Google profile URL should use the provided share link');
assert.match(data, /Whole chicken/i, 'revised menu should include whole chicken');
assert.match(data, /Liver|Gizzard/i, 'revised menu should include liver/gizzard');
assert.match(data, /questionBengali/i, 'FAQ data should include Bengali questions');
assert.match(data, /answerBengali/i, 'FAQ data should include Bengali answers');
assert.match(data, /UDYAM-I-WB-23-8437469/, 'site data should include the UDYAM number');
assert.doesNotMatch(data, /price:\s*["']₹/, 'menu data should not expose fixed rupee prices');
assert.doesNotMatch(data, /delivery/i, 'site data must be walk-in pickup only');

const envExample = read('.env.example');
assert.match(envExample, /VITE_SUPABASE_URL/, 'Supabase URL env key should be documented');
assert.match(envExample, /VITE_SUPABASE_PUBLISHABLE_KEY/, 'Supabase publishable key env key should be documented');

const supabaseClient = read('src/lib/supabase.ts');
assert.match(supabaseClient, /createClient/, 'Supabase client should be created through supabase-js');
assert.doesNotMatch(supabaseClient, /service_role|SERVICE_ROLE/i, 'browser client must not reference service role keys');

const schema = read('supabase/schema.sql');
assert.match(schema, /create table public\.products/, 'schema must define products');
assert.match(schema, /create table public\.bookings/, 'schema must define bookings');
assert.match(schema, /create table public\.profiles/, 'schema must define profiles');
assert.match(schema, /alter table public\.products enable row level security/i, 'products must enable RLS');
assert.match(schema, /grant select on table public\.products to anon, authenticated/i, 'products must be explicitly granted for Data API access');

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
