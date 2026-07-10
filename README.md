# Kathryn's Kreativity — online store

A full shopping-cart storefront for paintings, handmade jewelry, and resin crafts.
Same stack as your tutoring site: React + Vite, deployed on Netlify, backed by Supabase.

## What's included
- Storefront with category filtering (Paintings / Jewelry / Resin)
- Product detail pages with photo gallery
- Cart (persists in the browser between visits)
- Checkout that reserves the order and shows your payment info (Venmo/Cash App/Zelle/PayPal)
- Order confirmation screen with an order number
- Password-protected admin dashboard (`/admin`) to add/edit/hide/delete products,
  upload product photos, and manage order status (pending → paid → shipped → completed)
- Stock is tracked automatically and can't be oversold — if two people try to buy
  your last one-of-a-kind piece, only the first one gets it.

---

## 1. Create a NEW Supabase project

This must be a **separate** Supabase project from your tutoring one — different business, different database.

1. Go to [supabase.com](https://supabase.com) → New Project.
2. Name it something like `kathryns-kreativity`.
3. Once it's created, go to **SQL Editor** → paste in the contents of `supabase/schema.sql`
   (in this folder) → Run. This creates the `products` and `orders` tables, security rules,
   and the order-placing logic.
4. Go to **Storage** → Create a new bucket named exactly `product-images` → make it **Public**.
   This is where product photos you upload in the admin dashboard will live.
5. Go to **Authentication → Users** → Add user → create yourself an admin login
   (your email + a password). This is the only login that can access `/admin`.
6. Go to **Project Settings → API** → copy the **Project URL** and the **anon public** key.
   You'll need these in step 3 below.

## 2. Update your payment details

Open these two files and replace the placeholder handles with your real ones:
- `src/pages/Checkout.jsx` — look for `PAYMENT_OPTIONS` near the top
- `src/pages/OrderConfirmation.jsx` — look for `PAYMENT_LABELS` near the top

Also update the contact email placeholder in `src/components/Footer.jsx`.

## 3. Deploy to Netlify

1. Push this folder to a new GitHub repository.
2. In Netlify: **Add new site → Import an existing project** → pick the repo.
   Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. Before the first deploy, go to **Site settings → Environment variables** and add:
   - `VITE_SUPABASE_URL` → your Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY` → your Supabase anon public key
4. Deploy. Once it's live, point your domain (same Namecheap flow you used for
   mskingstutoring.com) at the Netlify site if you want a custom domain like
   `kathrynskreativity.com`.

## 4. Add your first products

Go to `yoursite.com/admin`, sign in with the account you created in step 1.5,
and add your first pieces — name, category, price, stock quantity, description,
and photos. They'll appear on the storefront immediately (uncheck "Hide" if a
product isn't showing).

## Local development (optional)

If you want to preview changes on your own computer before pushing:
```
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

## Notes on the design
Palette and type are original to this brand — not reused from the tutoring
site — built around the idea of a painter's studio: deep plum-black canvas,
cast-resin amber, and patinated verdigris, with a hand-set serif for headings
and a monospace utility face for prices and order numbers (like a hand-tagged
price tag). The blob-shaped category badges are the signature element, meant
to look like a wax seal on each piece.
