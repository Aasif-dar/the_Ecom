# AADYAM: premium fashion e-commerce demo

A complete, working e-commerce demo for a fictional Indian fashion and lifestyle label, **Aadyam** ("the first thing you reach for"). It has a customer storefront and a separate admin console. Everything runs in the browser with realistic mock data, so no backend is needed. Orders, stock, content and notifications are shared between both sides, so changes in admin show up in the shop instantly.

> **Demo only.** No payments are taken and no emails are sent.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 · shadcn/ui (Base UI primitives) · Lucide icons
- React Hook Form + Zod for every form
- Zustand (with `persist`) for cart, wishlist, auth, orders, catalog, content and settings
- Motion (`motion/react`) for a few intentional animations; Recharts for admin charts

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Demo accounts

| Role     | Email              | Password   |
| -------- | ------------------ | ---------- |
| Customer | `demo@aadyam.in`   | `demo1234` |
| Admin    | `admin@aadyam.in`  | `admin123` |

The customer account already has orders at every stage (processing, shipped, out for delivery, delivered, cancelled). The admin console lives at `/admin`. "Reset demo data" in the admin sidebar restores everything to the seed state.

Public tracking works without an account: `/track-order` with order `AAD-261003-1496` and mobile `98450 12873`.

## Things worth trying

1. **Shop flow:** search → filter → product → pick size → bag → checkout (UPI / card / net banking / COD) → confirmation → My orders → track.
2. **Live sync across tabs:** open an order as the customer in one tab. In another tab, sign in to `/admin` and move that order to *Shipped* or *Out for delivery*. The customer's page and notification bell update without a reload.
3. **Admin → shop:** add a product in `/admin/products/new` and it appears in the shop and in search. Zero its stock (Products → stock icon) and the product page shows *Sold out*.
4. **Failure paths:** tick *Demo: simulate a failed payment* at the payment step; try an out-of-stock size; open a bad URL.

## Architecture

```
src/
  app/            routes: (shop) storefront, admin/(console) + admin/(auth)
  components/     ui (primitives) · layout · home · product · shop · cart · checkout · account · admin
  data/           seed data (products, orders, users, reviews, content), separate from UI
  lib/            pricing, filtering, search, analytics, formatting, order lifecycle
  store/          persisted Zustand stores (catalog, orders, auth, cart, wishlist, site…)
  hooks/ types/
```

- **Backend-ready.** Components talk to stores and pure functions in `lib/`, never to seed files. To go live, swap the store actions (`placeOrder`, `updateStatus`, `addProduct`…) for API calls. Types in `src/types` mirror what an API would return.
- **SSR-safe persistence.** Stores start from deterministic seed data on the server and first client render, then rehydrate from `localStorage` after mount. Writes are blocked until rehydration finishes. Other tabs sync via the `storage` event.
- **Filters live in the URL**, so listings are shareable and refresh-safe.
- **Brand in one place.** Name, tagline and handle are in `src/lib/brand.ts`; the palette and type are tokens in `src/app/globals.css`.

## Notes

- Photography is from [Unsplash](https://unsplash.com) (free licence) and is bundled locally in `public/images`. Product shots were curated and cropped to a consistent 4:5 ratio; brand logos were avoided.
- No Instagram account was supplied with the brief, so the identity here is original: warm paper, ink black and a single terracotta accent, with Instrument Serif and Hanken Grotesk. Update `brand.ts` and the tokens to re-skin for a real label.
