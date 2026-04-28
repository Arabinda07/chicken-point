# Bikash Chicken Point storefront

A small Vite + React storefront for Bikash Chicken Point at Sabji Market, Fuljhore, Durgapur-713206, West Bengal.

The site helps local customers:

- call or WhatsApp the shop,
- ask for today's chicken rate before ordering,
- scan the UPI QR after order confirmation,
- find the shop on Google Maps,
- open the Google Business Profile QR/poster.

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

## Assets

The live payment QR is `assets/QR1.png`, converted from `assets/QR1.pdf`.
The Google Business Profile poster is `assets/Shop_GoogleQR.png`, converted from `assets/Shop_GoogleQR.pdf`.
The shop logo is `assets/logo.jpeg`.
