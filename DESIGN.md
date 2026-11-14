---
name: Bikash Chicken Point
description: Warm, crisp, honest local butcher counter on cream paper anchored by a Sanzo Wada Option A palette.
colors:
  brick-red: "#a84222"
  brown-deep: "#6c2b11"
  yellow-ocher: "#e0b81f"
  ivory-buff: "#ebd3a2"
  sandstone: "#f5ebd6"
  ecru: "#c2ae93"
  border-hairline: "#d8cab6"
  wada-black: "#111314"
  brown-warm: "#7c4226"
  whatsapp-green: "#15803D"
  whatsapp-green-hover: "#166534"
  canvas-cream: "#FAF7F2"
  surface-white: "#FFFFFF"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Bricolage Grotesque, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Bricolage Grotesque, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  chip: "0.75rem"
  control: "1rem"
  panel: "1.5rem"
  shell: "2rem"
  concentric-panel: "0.75rem"
  concentric-control: "0.625rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.brick-red}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brown-deep}"
  button-gold:
    backgroundColor: "{colors.yellow-ocher}"
    textColor: "{colors.wada-black}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-whatsapp:
    backgroundColor: "{colors.whatsapp-green}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.wada-black}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  chip-default:
    backgroundColor: "{colors.canvas-cream}"
    textColor: "{colors.brown-warm}"
    rounded: "{rounded.chip}"
    padding: "8px 12px"
  chip-active:
    backgroundColor: "{colors.canvas-cream}"
    textColor: "{colors.brown-deep}"
    rounded: "{rounded.chip}"
    padding: "8px 12px"
  card-paper:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.wada-black}"
    rounded: "{rounded.panel}"
    padding: "16px"
---

# Design System: Bikash Chicken Point

## Overview

**Creative North Star: "The Neighborhood Counter"**

Bikash Chicken Point is designed to feel like a clean, dependable local butcher counter on warm cream paper—direct, readable, and built for quick mobile decisions at home or in the market. Its color system draws from Sanzo Wada's *A Dictionary of Color Combinations* (`wada-sanzo-colors.com`), pairing earthy Brick Red, Deep Brown, Yellow Ocher, Ivory Buff, and Ecru over sunlit parchment surfaces.

The visual hierarchy prioritizes fast scanning: shop identity, live counter status, phone/WhatsApp actions, and cut availability come first, followed by clear step-by-step pre-booking and counter QR tools. Tactile press feedback (`scale(0.97)`), custom exponential easing, and concentric corner radii give every interactive control a grounded, physical feel.

**Key Characteristics:**
- Warm cream paper canvas with an ambient Brick Red top wash and crisp 1px Ecru-derived borders
- High-contrast Wada Black and Warm Brown ink for effortless mobile daylight readability
- Sturdy geometric display headings paired with humanist body copy, tabular monospace rates, and light Bengali accents
- Tactile, grounded controls with subtle press-down feedback and mathematical concentric corner geometry

## Colors

The palette adapts Sanzo Wada's classic red-ocher-ivory-brown combinations for high-contrast local commerce, reserving WhatsApp Green strictly for WhatsApp actions and live open-status indicators.

### Primary
- **Brick Red** (`brick-red`): Primary brand CTAs, active chip/input borders, hero gradient anchor, and counter highlights.
- **Deep Brown** (`brown-deep`): Display shop title, hover fill on primary buttons, hero gradient start, and Bengali sub-labels.

### Secondary
- **Yellow Ocher** (`yellow-ocher`): Hero primary CTA (paired with Wada Black ink for ~10.6:1 contrast), eyebrow sparkles, and pre-order status cues.
- **WhatsApp Green** (`whatsapp-green` / `whatsapp-green-hover`): Reserved exclusively for WhatsApp CTA buttons, UPI verification cues, and live "Counter Open" status badges.

### Neutral
- **Cream Paper** (`canvas-cream`): Primary page canvas and subtle inset surface fill.
- **Counter White** (`surface-white`): Elevated cards, modal sheets, and primary input backgrounds.
- **Ivory Buff & Sandstone** (`ivory-buff` / `sandstone`): Warm pill backgrounds (`Call Shop`, `Back to Shop`), VIP card tints, and hover fills.
- **Ecru & Parchment Hairline** (`ecru` / `border-hairline`): 1px structural borders on cards, controls, dividers, and grab handles.
- **Wada Black** (`wada-black`): Primary headings, body copy, and high-contrast tabular numbers.
- **Warm Brown** (`brown-warm`): Secondary metadata, helper captions, and inactive tab/chip labels.

### Named Rules
**The WhatsApp Green Rule.** Reserve `whatsapp-green` strictly for WhatsApp links/buttons, UPI verification cues, and live open-counter status—never use it as a generic brand accent.

**The Wada Warmth Rule.** Keep all neutrals in the Wada Sanzo warm paper-to-brown-black family (`canvas-cream`, `ivory-buff`, `ecru`, `brown-warm`, `wada-black`); never introduce cold slate grays.

## Typography

**Display Font:** `Bricolage Grotesque` (with `Georgia, serif` fallback)
**Body Font:** `Plus Jakarta Sans` (with system sans-serif fallback)
**Label/Mono Font:** `JetBrains Mono` (tabular numerals for prices, UTRs, and metrics)
**Accent Script:** `Noto Sans Bengali` (light bilingual labels and counter terms)

**Character:** Sturdy, approachable display letterforms with tight `-0.025em` tracking paired with clean, open sans-serif body text and crisp tabular monospace figures for weights, rates, and PhonePe UTR references.

### Hierarchy
- **Display** (800 weight, `1.5rem–2.25rem`, tight `-0.025em` tracking): Hero headline and primary page titles with `text-wrap: balance`.
- **Headline** (800 weight, `1.25rem–1.5rem`, tight tracking): Section headings such as "Today's Fresh Cuts & Counter Menu".
- **Title** (700 weight, `1rem`, tight tracking): Product card titles, step headings, and KPI card titles.
- **Body** (400–500 weight, `0.75rem–0.875rem`, `1.6` line-height): Product descriptions, FAQs, and form helper text.
- **Label** (600–800 weight, `0.6875rem–0.75rem`, `tabular-nums`): Prices (`₹/kg`), UPI IDs, Bank UTR codes, and status badges.

### Named Rules
**The Tabular Price Rule.** Always apply `tabular-nums` and the monospace stack to counter rates, weights, and rupee totals so numbers align cleanly across cards and ledgers.

## Layout

Content sits in centered single-column containers (`max-w-5xl` for the customer storefront, `max-w-6xl` for the owner dashboard) with `16px` (`1rem`) horizontal gutter padding and `24px` (`1.5rem`) vertical section rhythm. Product grids adapt from 1 column on mobile to 2 columns on tablet (`640px`) and 3 columns on desktop (`1024px`).

On mobile viewports, a sticky bottom action bar (`Call Shop` + `Pre-Book Pickup`) stays pinned within the `100dvh` dynamic viewport so primary actions remain thumb-reachable without overlapping content.

## Elevation & Depth

Surfaces use **layered paper cards**: crisp `1px` Ecru-tinted borders (`border-hairline`) on a warm cream canvas (`canvas-cream`), reinforced by soft warm-black shadows on resting cards and deeper floating shadows on overlays and hovered interactive elements.

### Shadow Vocabulary
- **Card Resting** (`0 4px 20px -4px rgba(17, 19, 20, 0.05), 0 2px 6px -2px rgba(17, 19, 20, 0.03)`): Default elevation for `.surface-paper` cards and containers.
- **Floating / Hover** (`0 16px 36px -6px rgba(17, 19, 20, 0.12), 0 6px 14px -3px rgba(17, 19, 20, 0.06)`): Elevated modals, frosted floating bars, and pointer-fine hover lift states.
- **Bezel Inset** (`0 1px 2px rgba(17, 19, 20, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)`): Tactile `.surface-bezel` highlight along the top edge of raised white surfaces.

### Named Rules
**The Grounded Card Rule.** Reserve hover-lift elevation exclusively for genuinely clickable surfaces; static KPI and product summary cards remain flatly grounded at rest.

## Shapes

The system uses a four-step rounded scale—`chip` (`12px`), `control` (`16px`), `panel` (`24px`), and `shell` (`32px`)—paired with mathematical concentric inner tokens (`concentric-panel` `12px`, `concentric-control` `10px`) so nested boxes align smoothly with their parent padding.

### Named Rules
**The Concentric Nesting Rule.** Any inner container nested inside a padded panel or control must step down its border radius (`outer radius - padding`) using `--radius-concentric-panel` or `--radius-concentric-control` rather than repeating the outer radius.

## Components

Controls are tactile and grounded: fast `150ms–180ms` transitions using explicit composited/color properties with `--ease-out-expo` (`cubic-bezier(0.16, 1, 0.3, 1)`), subtle `:active` press scale (`0.97` on buttons/chips, `0.985` on interactive customer cards), visible `focus-visible` rings, and hover lifts gated behind `@media (hover: hover) and (pointer: fine)`.

### Buttons
- **Shape:** `16px` (`--radius-control`) for `md`/`lg`; `12px` (`--radius-chip`) for `sm`.
- **Primary:** Solid `brick-red` (hover `brown-deep`), `yellow-ocher` (with `wada-black` text), or `whatsapp-green` fill with `min-h-[44px]` (`md`) touch target and `active:scale-97` press feedback.
- **Hover / Focus:** Subtle `-2px` lift on fine pointers and visible `focus-visible` ring (`brick-red` at 40% opacity).
- **Secondary / Outline / Ghost:** Crisp `1px` hairline border (`control-surface`) or transparent ghost with warm `sandstone` hover fill.

### Chips
- **Style:** Compact `12px` (`--radius-chip`) pill with `1px` border; `canvas-cream` at rest, tinted `10%` `brick-red`/`whatsapp-green` or `20%` `yellow-ocher` fill with `700` weight when `aria-pressed="true"`.
- **State:** `active:scale-97` press feedback and `focus-visible` ring.

### Cards / Containers
- **Corner Style:** `24px` (`--radius-panel`) for outer cards; `12px` (`--radius-concentric-panel`) for nested step/dropzone blocks; `10px` (`--radius-concentric-control`) for nested QR images and metric tiles.
- **Background:** `surface-white` or subtle `145deg` white-to-cream gradient (`.surface-paper`).
- **Border:** `1px solid` `border-hairline`.
- **Internal Padding:** `16px` (`p-4`) standard; `12px` (`p-3`) on interactive customer cards; `20px–24px` inside modal sheets.

### Inputs / Fields
- **Style:** `16px` (`--radius-control`) border radius, `1px` `border-hairline` stroke, `canvas-cream` or `surface-white` background, and `16px` (`text-base`) font size on mobile `<select>` controls to prevent iOS Safari auto-zoom.
- **Validation:** Uses `:user-invalid` / `:user-valid` so error states appear only after user interaction.

### Navigation
- **Style:** Sticky frosted-glass header (`surface-white` at 90–95% opacity with `backdrop-blur-md`) and underline `TabList` navigation.

### Signature Component: Adaptive ModalSheet
- **Behavior:** Renders as a bottom-anchored sheet with a `36px × 4px` grab handle on mobile (`<640px`) and a centered `560px` dialog on desktop, using `overscroll-behavior: contain` and `88dvh` max height.

## Do's and Don'ts

### Do:
- **Do** use `Button`, `Chip`, `Surface`, and `ModalSheet` primitives instead of ad-hoc `<button>` or `<div>` styles.
- **Do** gate hover transforms behind `@media (hover: hover) and (pointer: fine)` and pair pressable controls with `active:scale-97` and `--ease-out-expo`.
- **Do** use `tabular-nums` and monospace styling for all prices (`₹/kg`), weights, and PhonePe UTRs.
- **Do** step down nested border radii using `--radius-concentric-panel` and `--radius-concentric-control`.

### Don't:
- **Don't** use `transition: all`; always specify exact composited/color properties (`transform`, `background-color`, `border-color`, `box-shadow`).
- **Don't** apply `hover-lift` to non-clickable KPI or product summary cards.
- **Don't** use `whatsapp-green` for non-WhatsApp / non-open-status decoration.
- **Don't** use `font-size < 16px` on mobile `<select>` or `<input>` controls where iOS Safari auto-zoom can trigger.
