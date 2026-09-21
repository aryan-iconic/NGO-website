# Shri Nityanikunj Trust — Platform

A real, working Next.js 15 (App Router) application — public site, user accounts,
donations, monthly giving, 2FA-protected admin panel with full content
management, and a working (if simplified) language toggle. Verified with
`next build` (zero errors) and a full API-level smoke test of every major
flow, including the complete 2FA lifecycle (see "What's verified" below).

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Data persists to `.data/db.json` (git-ignored) —
delete that file to reset to the seed data.

**Demo admin login** (`/admin/login`): `admin@nityanikunj.org` / `Admin@12345`
(2FA is off by default for this account — enable it from `/admin/settings`
with any authenticator app, e.g. Google Authenticator or Authy.)

## What's actually working end-to-end

### Public site
Home, campaign listing + filters, campaign detail (story, products, timeline,
updates, FAQs), events + registration, gallery, blog, volunteer form, contact
form, FAQ, About, all four legal pages, and a language toggle (English/Hindi)
in the navbar that actually re-renders navigation, hero, and section copy.

### Donations (one-time)
Add products to a cart from a campaign page, or pick a custom amount, go to
checkout, submit donor details, and the server recalculates every line item
from the current product price, checks quantity limits, "settles" payment
(mocked — see note below), generates a sequential donation number and an
immutable receipt number, and reserves product inventory.

### Monthly giving
`/monthly` — pick a recurring amount, direct it to a campaign or the general
fund, submit donor details, and a subscription is created (mock gateway
authorization, same pattern as one-time donations). Shown and cancellable
from the user dashboard; admins see every subscription at `/admin/recurring`.

### Auth
Register/login with hashed passwords (bcrypt) and signed session cookies,
separate from the admin session. Navbar reflects real logged-in state.

### User dashboard
`/user/dashboard` — real donation history and totals, plus active monthly
giving with a working cancel button, for the logged-in user.

### Admin panel
Separate login/session, middleware-guarded routes, **two-factor
authentication** (TOTP, QR-code setup, enforced at every login once
enabled — full lifecycle verified with real generated codes, not just the
UI). Campaign creation/editing/status workflow, per-campaign financials
(admin-only, structurally separate from the public API), donations table,
monthly giving table, volunteer applications, contact inbox, and **full CRUD
for blog posts, events, and FAQs** (create/edit/delete, not just read-only
lists) — plus a real append-only audit log recording campaign changes and
2FA enable/disable.

### Rule enforcement is real, not just hidden UI
Every `/api/admin/*` route calls `requireAdmin()` first. A logged-in normal
user — or a request with no session at all — gets a real `401`/`403`,
verified by curl during testing for campaigns, blog, events, and FAQs alike.

## What's mocked, and why

- **Payment gateway**: `POST /api/donations` and `POST /api/recurring` settle
  immediately instead of creating a Razorpay order/subscription and waiting
  for a webhook. This sandbox has no Razorpay keys to test against, so the
  real flow (`create-order` → checkout → `verify` → webhook) is documented
  inline in those two files rather than stubbed elsewhere. Swapping in a real
  gateway means replacing the settlement call in those two files; the
  donation/subscription/receipt/inventory logic around it doesn't change.
- **Data layer**: `src/lib/db.ts` is an in-memory store persisted to a JSON
  file, with the same shapes as `prisma/schema.prisma`. This sandbox's
  network allowlist doesn't include `binaries.prisma.sh`, so the Prisma CLI
  can't download its query engine here — real Postgres was not reachable to
  verify against. The schema file is production-ready; swapping `db.ts`'s
  functions for `prisma.<model>.*` calls is the migration path.
- **i18n**: `src/lib/i18n.tsx` is a client-side language toggle (English/Hindi)
  covering navigation, hero, and section headings — not the spec's
  next-intl + locale-prefixed-routing approach. That approach server-renders
  each locale at its own URL and lets every field (including admin-authored
  campaign stories and blog posts) carry a translation — real schema and
  routing work, not a UI pass. What's here proves the mechanism end-to-end;
  extending it to content fields is the next step, and matches the spec's
  own phasing (full Hindi content is Release 2, not MVP).
- **Email**: receipts, confirmations, and 2FA-related notices are generated
  but not actually emailed — no SMTP/Resend credential is configured here.
- **Gallery images / cover photos**: styled placeholders, not real uploaded
  photography — no object storage (S3/R2) connected in this environment.

## What's not built

- PDF receipt generation (currently a receipt *number*, no rendered PDF)
- Admin settings persistence (`/admin/settings` renders the structure from
  the spec but doesn't save — 2FA is the one settings sub-feature that's
  fully wired)
- Refunds, offline donation recording, CSV report export
- Per-content-field translations (see i18n note above)

## Project structure

```
src/
  app/                  Pages + API routes (Next.js App Router)
    api/                Route handlers — the "backend"
      admin/2fa/         2FA setup/verify/challenge/disable
      admin/blog|events|faqs/   Full CRUD, admin-guarded
      recurring/          Monthly giving
    admin/               Admin panel (middleware-guarded)
      content/blog|events|faqs/   Create/edit forms
    campaigns/, donate/, monthly/, user/, events/, blog/, ...
  components/
    admin/               Status toggle, campaign/blog/event forms, FAQ manager, 2FA panel
    i18n/                <T k="..."/> — drop a translated string into a server component
  lib/
    db.ts                Data layer (swap for Prisma+Postgres in production)
    auth.ts              Session cookies + 2FA pending-token signing
    totp.ts              TOTP secret generation, QR code, code verification
    schemas.ts           Zod validation shared by API + forms
    i18n.tsx             Language context + dictionary
    types.ts, view-models.ts   Public-facing types — no financial fields
prisma/schema.prisma     Production data model (Postgres)
```
