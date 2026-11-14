# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Local customers around Fuljhore, Sabji Market, and nearby Durgapur neighborhoods who want to quickly check chicken availability, ask the day's rate, and order by phone or WhatsApp. Most visits should work well on a mobile phone while the customer is at home, at the market, or planning a meal.

*Inferred from codebase (unconfirmed in interview):* Bulk/B2B buyers requesting GST-compliant invoices (`App.tsx` Bulk & B2B tab) and the shop owner reviewing PhonePe UPI statements and customer loyalty (`EarningsDashboard.tsx`).

## Product Purpose

Help neighborhood customers check daily chicken cuts and availability, pre-book for walk-in pickup at the Fuljhore Sabji Market counter, or inquire via phone/WhatsApp without friction.

## Positioning

A real neighborhood butcher counter with clear order steps and honest local trust cues—not a startup landing page or a luxury meat brand. Customers confirm the final weight and day's rate at the counter scale before paying, with no advance payment required.

## Operating Context

- Primary usage is on mobile phones while customers are at home, at the market, or planning a meal.
- Counter hours: 8 AM – 9 PM (`Asia/Kolkata`), Fuljhore Sabji Market, Durgapur-713206, West Bengal.
- Orders are coordinated via phone call or WhatsApp pre-booking summary; payment is settled at the counter via Google Pay/PhonePe/UPI or cash after weighing.

## Capabilities and Constraints

- Lead with the shop logo, shop location, phone, WhatsApp, and today's rate flow.
- Do not show stale binding public prices; ask customers to confirm the day's rate at the counter before payment.
- Keep Bengali as a warm accent, not a full bilingual rewrite.
- Prefer honest local trust cues (Udyam MSME registration, Google Business Profile) over fake ratings, testimonials, or generic quality claims.

## Brand Commitments

- **Personality:** Clean local shop, direct, and trustworthy.
- **Aesthetic constraints:** Use the shop logo as the identity anchor (red and warm gold, sturdy typography, practical spacing, and light Bengali touches). Keep WhatsApp green only for WhatsApp and open-status meaning. The page should be mostly light, readable, and fast to scan.

## Evidence on Hand

- Real shop assets in `assets/`:
  - Shop logo: `assets/logo.jpeg`
  - Google Pay / BHIM UPI payment QR (`9635021694@okbizaxis`): `assets/QR1.png`
  - Google Business Profile review QR (`Bikash Chicken Shop, Durgapur`): `assets/Shop_GoogleQR.png`
- Registered Udyam MSME number and verified UPI ID (`9635021694@okbizaxis`) in `src/data.ts`.
- **Absences not to fabricate:** No invented customer testimonials, star ratings, or unverified quality certifications.

## Product Principles

- Lead with the logo, shop location, phone, WhatsApp, and today's rate flow.
- Ask customers to confirm the day's rate and final scale weight before payment.
- Use real shop assets (logo, payment QR, Google Business Profile QR).
- Prefer honest local trust cues over fake ratings or generic marketing claims.
- Keep Bengali as a warm accent rather than a full bilingual rewrite.
