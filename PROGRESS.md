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

---

## 3. Next Session Roadmap (Execute Step-by-Step — Not All at Once)

### Step 1: Wada Sanzo Color Palette Upgrade (`https://www.wada-sanzo-colors.com/` & `DESIGN.md`)
- [x] Replace the current sterile/bland zinc-and-white palette (`#FAFAF9`, `#E4E4E7`, `#18181B`, `#52525B`, `#B91C1C`, `#D97706`) with a warm, tactile **Sanzo Wada** color combination anchored in `DESIGN.md` and `wada-sanzo-colors.com` (warm cream paper `#FAF7F2`, sandstone `#f5ebd6`, ivory buff `#ebd3a2`, ecru 1px borders `#d8cab6`, brick red `#a84222`, deep brown `#6c2b11`, yellow ocher `#e0b81f`, Wada black `#111314`, warm brown `#7c4226`).
- [x] Apply the palette cleanly across `src/index.css` (aligned with `@astryxdesign/core` `[data-astryx-theme="stone"]` tokens), `src/components/ui/*`, and the 6 bands in `src/App.tsx` without re-introducing clutter.
- [x] *Paused for user review before moving to Step 2.*

### Step 2: Copy Audit & De-Slop (`unslop` Skill)
- [x] Run a two-pass `unslop` audit across `src/data.ts`, `src/App.tsx`, and `src/components/ui/CartDrawer.tsx`.
- [x] Rewrite headlines, subheadlines, 1-line cut descriptions, trust pillars, and the shop story so they sound unmistakably like a real, trustworthy Fuljhore neighborhood shop (`PRODUCT.md`).
- [x] *Paused for user review before moving to Step 3.*

### Step 3: UI Craft & Visual Polish (`impeccable` + `emil-design-eng` Skills)
- [x] Refine optical alignment, concentric corner radii (`--radius-panel` vs `--radius-concentric-panel`), card depth (`.surface-paper` & subtle top-edge bezel highlights), and upgrade the `4:3` and `16:10` visual frames so they feel crafted rather than placeholder-like.
- [x] Ensure real counter assets (`assets/QR1.png`, `assets/Shop_GoogleQR.png`, `assets/logo.jpeg`) are surfaced with high visual clarity where appropriate.
- [x] *Paused for user review before moving to Step 4.*

### Step 4: Animations & Micro-Interactions (`emil-design-eng` Skill)
- [x] Audit and implement purposeful, physical motion:
  - Custom exponential easing (`--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`) and drawer easing (`--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`).
  - Tactile `:active` scale feedback (`scale(0.97)`) on buttons, category pills, and `500g / 1kg` weight toggles.
  - Smooth category filter transitions, tabular price transitions when toggling `500g` / `1kg`, Cart badge bump feedback on `+ Add`, and polished Cart Drawer enter/exit transitions.
  - Full `prefers-reduced-motion: reduce` compliance.
- [x] Run final `375px` and `1440px` verification.

---

## 4. Starting Prompt for Next Session

```text
Read PROGRESS.md, PRODUCT.md, and DESIGN.md first. We are improving the 6-band Bikash Chicken Point storefront step-by-step—do NOT do everything at once.

Load the `impeccable`, `emil-design-eng`, and `unslop` skills. We will work through the 4 steps in PROGRESS.md one at a time, pausing for my approval after each step:

Step 1 (Start here): Upgrade the color palette from the current bland zinc/white palette to a warm, tactile Sanzo Wada palette inspired by https://www.wada-sanzo-colors.com/ and DESIGN.md (warm cream paper canvas, sandstone/ivory-buff secondary tints, ecru 1px hairlines, brick red & deep brown primary accents, yellow ocher highlights, and Wada black/warm brown ink) while keeping our clean 6-band layout and spacing intact. Propose the exact Wada Sanzo color combination and apply Step 1 only, then stop for my review before moving to Step 2 (unslop copy), Step 3 (impeccable UI polish), and Step 4 (emil-design-eng animations).
```
