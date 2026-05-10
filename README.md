# Bikash Chicken Point click-and-collect app

A Vite + React + Supabase walk-in pickup app for Bikash Chicken Point at Sabji Market, Fuljhore, Durgapur-713206, West Bengal.

The site helps local customers:

- call or WhatsApp the shop,
- pre-book chicken with weight, cut style, and pickup time,
- see current counter rates from Supabase,
- check a simple digital loyalty stamp card,
- scan the UPI QR after order confirmation,
- find the shop on Google Maps,
- open the Google Business Profile QR/poster.

The owner can use the hidden `/admin` route to update prices and availability after signing in with Supabase Auth.

Public listing link: https://share.google/B1iUixv7uA7BVarqb

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Check the site contract, TypeScript, and production build:

   ```bash
   npm test
   npm run lint
   npm run build
   ```

## Supabase setup

Copy `.env.example` to `.env` and set:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

Run `supabase/schema.sql` in Supabase SQL editor. Create the owner in Supabase Auth, then set `app_metadata.role` to `owner` for that user.

## Assets

The live payment QR is `assets/QR1.png`, converted from `assets/QR1.pdf`.
The Google Business Profile poster is `assets/Shop_GoogleQR.png`, converted from `assets/Shop_GoogleQR.pdf`.
The shop logo is `assets/logo.jpeg`.
