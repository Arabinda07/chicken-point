# Bikash Chicken Point — Standing References & Work Progress

## 1. Standing References & Source of Truth

- **Product & Domain Context**: [`PRODUCT.md`](./PRODUCT.md)
  - Real neighborhood butcher counter at **Sabji Market, Fuljhore, Durgapur-713206, West Bengal** (Open daily, `8:00 AM – 9:00 PM` `Asia/Kolkata`).
  - Phone / WhatsApp: `+91 96350 21694` (`919635021694`).
  - Udyam MSME Registration: `UDYAM-I-WB-23-8437469` | Verified Google Pay / BHIM UPI ID: `9635021694@okbizaxis`.
  - Real shop assets in `assets/`:
    - Shop Logo: `assets/logo.jpeg`
    - Google Pay / BHIM UPI Standee QR: `assets/QR1.png`
    - Google Business Profile & Review QR: `assets/Shop_GoogleQR.png`
  - **Honesty & Voice Rules**: No fake star ratings, no fabricated customer testimonials, and no generic startup clichés. Keep Bengali as a warm local accent rather than a full bilingual duplicate.
- **Design System & Color Reference**: [`DESIGN.md`](./DESIGN.md) & **Sanzo Wada's *A Dictionary of Color Combinations*** (`https://www.wada-sanzo-colors.com/`)
  - Reference Wada Sanzo warm paper-to-terracotta palette tokens in `DESIGN.md`:
    - `canvas-cream`: `#FAF7F2`
    - `surface-white`: `#FFFFFF`
    - `sandstone`: `#f5ebd6`
    - `ivory-buff`: `#ebd3a2`
    - `border-hairline` / `ecru`: `#d8cab6` / `#c2ae93`
    - `brick-red`: `#a84222`
    - `brown-deep`: `#6c2b11`
    - `yellow-ocher`: `#e0b81f`
    - `wada-black`: `#111314`
    - `brown-warm`: `#7c4226`
    - `whatsapp-green`: `#15803D` (strictly reserved for WhatsApp CTAs and live open-status cues)
- **Layout Rhythm Reference**: `.reference/stitch_desi_murga_landing_page/home_desi_murga_rampur_village/code.html`
  - Used **strictly** for section hierarchy, grid proportions, and vertical rhythm—never copy its colors, fonts, or external image URLs.
- **Core Skills for Next Session**:
  - `impeccable` — UI craft, visual hierarchy, optical balance, surface depth, and anti-generic component design.
  - `emil-design-eng` — Emil Kowalski's UI polish principles, custom physical easing (`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`), tactile press states (`scale(0.97)`), concentric border radii, and restrained, purposeful animations.
  - `unslop` — Two-pass prose audit and rewrite to eliminate robotic/AI phrasing and ground all copy in authentic Fuljhore local shop language.

---

## 2. Completed Work Progress

- [x] **Codebase & CSS Cleanup**:
  - Audited Vite + React 19 + Tailwind CSS v4 setup (`src/index.css`, `src/App.tsx`, `src/components/ui/*`).
  - Removed unused CSS selectors, redundant nested card-in-card borders, and the cluttered mobile sticky bottom bar.
- [x] **6-Band Landing Page Architecture (`src/App.tsx`)**:
  - **Sticky Navbar**: Brand logo & name, 3 anchor links (`Cuts`, `Our Standards`, `Visit Us`), service area pill (`Fuljhore, Durgapur`), and a single **Cart trigger button** with live item count.
  - **Band 1 — Split Hero**: Left column with `text-4xl md:text-6xl font-bold tracking-tight` headline, concise 2-sentence subheadline, primary `Browse Fresh Cuts` CTA, and 3 trust badges; right column with a `4:3` rounded visual container.
  - **Band 2 — Trust & Hygiene Strip**: 4-column grid (`Morning Harvest`, `100% Hygienic Dressing`, `Custom Cuts`, `Fast Local Delivery`).
  - **Band 3 — Product Catalog (`#cuts`)**: 5 category filter pills (`All Cuts`, `Curry Cuts`, `Boneless`, `Wings & Drumsticks`, `Specials`) connected to `src/data.ts`, above a 3-column desktop / 1-column mobile minimal card grid (`16:10` visual frame, title, 1-line description, interactive `500g / 1kg` weight pill, scaled price, and `+ Add` button).
  - **Band 4 — Shop Story / Quality Split (`#standards`)**: 2-column split contrasting fresh-to-order counter dressing against pre-frozen stock.
  - **Band 5 & 6 — Bulk/Party Order Banner (`#visit-us`) & 3-Column Footer**: Direct `Call` and `WhatsApp` bulk inquiry buttons + 3-column footer (Address & Udyam MSME, Hours & Contact, Quick Links).
- [x] **Slide-Over Cart Drawer (`src/components/ui/CartDrawer.tsx`)**:
  - Single right-hand slide-over drawer with quantity adjustments (`-` / `+` / remove), cut style selection (`Curry`, `Biryani`, `Fry`), pickup timing, customer details, GST invoice option, and multi-item WhatsApp order submission.
- [x] **Route-Only Admin Access (`/admin`)**:
  - Removed all Admin toggle buttons from the public storefront; `EarningsDashboard` is now accessible exclusively via the `/admin` URL path.
- [x] **Viewport & Overflow Audit (`375px` & `1440px`)**:
  - Verified zero horizontal overflow (`scrollWidth <= clientWidth`), zero overlapping text nodes, and consistent `py-16 md:py-24` (`64px` / `96px`) section spacing and `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container padding in headless Chrome.
- [x] **Visual-First `@astryxdesign/core` Storefront Upgrade**:
  - **Step 1**: Deleted all 4 section eyebrow/kicker labels (`impeccable` craft-floor ban) and replaced the 4 boxed `Surface` cards in Band 2 with a borderless 4-column architectural strip separated by `1px` Ecru `@astryxdesign/core` `<Divider>` hairlines.
  - **Step 2**: Converted the `#cuts` category pills and 8-card grid into `@astryxdesign/core`'s `<TabList role="tablist" overflow="scroll">` + `<Carousel gap={3} hasButtons hasEdgeFade hasSnap={useSnapPaging({ pages: 'item' })}>`.
  - **Step 3**: Stripped product cards down by ~65% to a 4-element visual-first anatomy (`<Card>`, `<AspectRatio ratio={4 / 3} fit="cover">` with bespoke Sanzo Wada cut art plates and at most 1 `<Badge>` on 3 signature cuts, single-row English+Bengali title, 3-word spec line, and unified `<SegmentedControl>` + tabular price + `+ Add` footer).
  - **Step 4**: Streamlined Band 1 Hero right column (`<Card>` + `<AspectRatio>` + `<StatusDot>` + `assets/logo.jpeg`), converted Band 4 `#standards` left card to a 2-tab `<TabList>` (`Counter Process` | `Scan & Pay QR`), and upgraded `CartDrawer.tsx` to `@astryxdesign/core`'s native top-layer `<Drawer>` + `<DrawerHeader>` + `<SegmentedControl>`.
- [x] **Right-Side Surfaces Rebuild, StyleX/Tailwind Cascade Fix & Full-Container QR `<Carousel>`**:
  - **CSS Cascade Layer Ordering (`src/main.tsx`, `src/index.css`)**: Declared `@layer theme, base, reset, astryx-base, astryx-theme, components, utilities;` before `@import "tailwindcss";` and imported `./index.css` first in `src/main.tsx` so Tailwind v4's `@layer base` preflight (`* { padding: 0; border: 0 solid; }`) no longer wipes out `@astryxdesign/core` StyleX borders and paddings (`--border-width: 1px`, `--radius-container: 1.5rem`).
  - **Band 1 Hero Right-Column Showcase (`src/App.tsx`)**: Rebuilt into a structured Sanzo Wada counter voucher card (`<Card padding={0} elevation="low">`) with a live status strip (`Open Now · 8 AM – 9 PM` + `Fuljhore Market`), framed `assets/logo.jpeg` emblem, Bengali accent (`বিকাশ চিকেন পয়েন্ট`), 3-step architectural workflow strip (`Pre-Book List` | `Cut Fresh Live` | `Pay at Scale`), and verified Udyam MSME / direct phone footer.
  - **Band 4 Full-Container QR `<Carousel>` (`src/App.tsx`, `src/index.css`)**: Replaced the two tiny 144px thumbnail buttons and `activeQrPreview` `ModalSheet` with a full-container `@astryxdesign/core` `<Carousel gap={0} hasButtons hasEdgeFade={false} hasSnap={useSnapPaging({ pages: 'item' })}>` synced bidirectionally with `<TabList>` (`UPI Payment QR` | `Google Review QR`), showcasing `assets/QR1.png` and `assets/Shop_GoogleQR.png` at full scannable height (`340px–380px`).
  - **3-Zone Slide-Over Cart Drawer (`src/components/ui/CartDrawer.tsx`)**: Rebuilt `<Drawer padding={0}>` with pinned header (`px-5 sm:px-6 pt-5 pb-4`), scrollable body (`px-5 sm:px-6 py-5`), two-line mobile-safe cart item cards (zero title truncation at `375px`), pinned bottom summary + `tone="whatsapp"` primary CTA, and a full-size scannable `assets/QR1.png` (`h-56 sm:h-64`) in the confirmed state.

---

## 3. Next Session Roadmap (Final Polish, SEO Schema & Release)

### Step 1: LocalBusiness / ButcherShop JSON-LD Schema (`index.html`)
- [x] Add structured JSON-LD (`@type: ["LocalBusiness", "FoodEstablishment", "ButcherShop"]`) in `index.html` with accurate verified shop details from `PRODUCT.md`:
  - Name: `Bikash Chicken Point` (`বিকাশ চিকেন পয়েন্ট`)
  - Address: `Sabji Market, Fuljhore, Durgapur-713206, West Bengal, IN`
  - Telephone / WhatsApp: `+91 96350 21694`
  - Opening Hours: `Mo-Su 08:00-21:00` (`Asia/Kolkata`)
  - Payment Accepted: `Cash, UPI (9635021694@okbizaxis)`
  - Identifier: `UDYAM-I-WB-23-8437469`
  - **Honesty Rule**: Never include fake `aggregateRating` or fabricated review counts.

### Step 2: `/admin` Route (`EarningsDashboard.tsx`) Wada Sanzo & `@astryxdesign/core` Polish
- [x] Audit `/admin` (`src/components/EarningsDashboard.tsx`) at `375px` and `1440px` in headless Chrome.
- [x] Align its surfaces, borders, typography, and controls with `DESIGN.md` (Sanzo Wada warm cream paper `#FAF7F2`, sandstone `#f5ebd6`, 1px ecru borders `#d8cab6`, brick red `#a84222`, deep brown `#6c2b11`, tabular-nums pricing) and `@astryxdesign/core` primitives.

### Step 3: `.gitignore` Cleanup, Final Build & Git Push
- [x] Add `.reference/` to `.gitignore` so external reference HTML is excluded from version control.
- [x] Run `npm run lint && npm run build` and verify zero errors.
- [x] Stage, commit with a clear message, and push to the remote repository.

---

## 4. Starting Prompt for Next Session

```text
Read PROGRESS.md, PRODUCT.md, and DESIGN.md first, and load the `impeccable` and `emil-design-eng` skills.

Execute the final polish & release roadmap in PROGRESS.md:
1. **LocalBusiness JSON-LD Schema (`index.html`)**: Add honest, verified `LocalBusiness` / `ButcherShop` structured data in `index.html` using exact details from `PRODUCT.md` (Sabji Market, Fuljhore, Durgapur-713206, `+91 96350 21694`, daily `08:00–21:00`, UPI `9635021694@okbizaxis`, Udyam `UDYAM-I-WB-23-8437469` — no fake ratings or reviews).
2. **`/admin` Route Polish (`src/components/EarningsDashboard.tsx`)**: Audit `/admin` in headless Chrome at `375px` and `1440px`, then restyle and refine `EarningsDashboard.tsx` so its cards, tables/lists, inputs, and header match `DESIGN.md` (Sanzo Wada warm paper palette, 1px ecru hairlines, `tabular-nums` ledger clarity, and clean `@astryxdesign/core` surfaces). Verify with `375px` and `1440px` screenshots.
3. **Repo Cleanup & Push**: Add `.reference/` to `.gitignore`, run `npm run lint && npm run build`, and once everything passes cleanly, stage, commit, and push to remote.
```
