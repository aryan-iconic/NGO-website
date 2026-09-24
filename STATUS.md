# Shri Nityanikunj Trust Platform — Implementation Status

Last updated against the codebase as of this file's creation. This is a ground-truth
audit, not a plan — every "✅ Done" item has been either curl-tested or clicked through;
every "⚠️ Partial" item names exactly what's missing; nothing here is aspirational.

Legend: ✅ Done & verified · ⚠️ Partial (backend exists, not wired / or wired but simplified) · ❌ Not started

---

## 1. Core Architecture

| Item | Status | Notes |
|---|---|---|
| Next.js 15 App Router project, builds clean | ✅ | `next build` zero errors, re-verified after every feature round |
| Design system (colors, type, spacing as CSS vars) | ✅ | `src/app/globals.css` — one file to re-theme |
| Prisma schema (production data model) | ✅ | `prisma/schema.prisma` — Postgres-ready and fully connected (see §9) |
| Working data layer for this sandbox | ✅ | `src/lib/db.ts` — fully migrated to use Prisma Client and PostgreSQL |
| Session auth (user + admin, separate cookies) | ✅ | HMAC-signed cookies, `src/lib/auth.ts` |
| Admin route guarding | ✅ | `requireAdmin()` on every `/api/admin/*` route + `middleware.ts` for pages — tested 401/403 with curl, not just hidden UI |
| Zod validation on all mutating API routes | ✅ | `src/lib/schemas.ts` + inline schemas per route |
| Audit log (append-only) | ✅ | Campaign create/status-change, 2FA enable/disable logged. **Not yet logged:** blog/event/FAQ create (routes call `logAudit` for blog/events but double-check FAQ — see §7) |

---

## 2. Public Site — Pages

| Page | Status | Notes |
|---|---|---|
| Home | ✅ | Hero, seva areas, featured campaigns, monthly giving teaser, how-it-works, CTA |
| Campaign listing (`/campaigns`) | ✅ | Category filter via query param |
| Campaign detail (`/campaigns/[slug]`) | ✅ | Story, products w/ cart, custom amount, timeline, updates, FAQs, related campaigns |
| Donate (general, `/donate`) | ✅ | Presets + custom amount → cart → checkout |
| Checkout (`/donate/checkout`) | ✅ | Real order calc, donor form, submits to `/api/donations` |
| Thank-you page | ✅ | Shows real receipt number |
| Monthly giving (`/monthly`) | ✅ | Amount + campaign picker → real subscription |
| Events listing + detail | ✅ | Real registration form, duplicate-email prevention |
| Gallery | ⚠️ | Real filter/lightbox UI, but **images are gradient placeholders** — no real photos, no upload pipeline (see §9) |
| Blog listing + detail | ✅ | Reads from real (admin-editable) data |
| Volunteer form | ✅ | Posts to `/api/volunteers`, admin sees it in `/admin/people` |
| Contact form | ✅ | Posts to `/api/contact`, admin sees it in `/admin/people` |
| FAQ page | ✅ | Grouped by category, admin-editable |
| About | ✅ | Static content per spec's sections; transparency block intentionally empty (no invented registration/legal data) |
| Legal pages (privacy/terms/refund/donation policy) | ✅ | Static content, real pages |
| Login / Register | ✅ | Real bcrypt + session |
| **Forgot / Reset password** | ❌ | **Not built at all.** No `/forgot-password` or `/reset-password` route, no email token flow. Spec lists this explicitly (Section 6.2) |
| Email verification | ❌ | Not built. `emailVerifiedAt` field is unused |
| Google login | ❌ | Not built (spec marks this optional) |

---

## 3. Contact / Communication Touchpoints — the specific gap you flagged

This is the area with the most small-but-visible gaps:

| Item | Status | Notes |
|---|---|---|
| Click-to-call phone link (`tel:`) | ❌ | Contact page and footer currently show placeholder text ("Contact phone will appear here once provided by the Trust") instead of a real `tel:` link, because no phone number exists anywhere in the system yet |
| Click-to-email (`mailto:`) | ❌ | Same — no real email configured to link to |
| **WhatsApp click-to-chat** (`wa.me/<number>?text=...`) | ❌ | Not built anywhere — not on the contact page, not as a floating button, not in the footer |
| Google Maps link for address | ❌ | Not built — address is placeholder text, no map embed or "Get Directions" link |
| Social share buttons on campaign pages | ✅ | Implemented WhatsApp/Facebook/X/Copy Link share buttons on campaign detail and blog posts using `ShareButtons` component. |
| Newsletter signup | ❌ | Footer has no email capture; no `newsletter_subscribers` equivalent in `db.ts` |
| **Why this is fixable fast:** `db.ts` already has `getSiteSettings()`/`updateSiteSettings()` (added but **not yet wired to any API route or admin UI** — see §7). Once an admin can actually enter a phone/email/WhatsApp number through a real settings form, the contact page, footer, and a WhatsApp button become "render this value as a link" work, not new architecture. |

---

## 4. Donations & Payments

| Item | Status | Notes |
|---|---|---|
| One-time donation (products + custom amount) | ✅ | Server recalculates every price, checks quantity limits |
| Monthly/recurring giving | ✅ | Create, list, cancel — all tested |
| Payment gateway | ⚠️ | **Mocked** — settles instantly instead of Razorpay create-order/verify/webhook. No Razorpay keys available in this environment. Real integration point is isolated to `POST /api/donations` and `POST /api/recurring` |
| Receipt **number** generation | ✅ | Sequential, immutable, real |
| Receipt **PDF** | ❌ | `pdfkit` is installed in `package.json` but **not used anywhere** — no route generates an actual PDF file. Users/admins only ever see a receipt number, never a downloadable document |
| Email receipt/confirmation | ⚠️ | `db.sendEmail()` exists (logs what would be sent) but **nothing calls it** — no email fires on donation success, registration, contact form, etc. |
| Refunds | ⚠️ | `db.refundDonation()` exists in the data layer but **no API route, no admin UI button** — an admin cannot actually issue a refund right now |
| Offline donation recording (cash/bank/cheque) | ⚠️ | `db.createOfflineDonation()` exists but **no API route, no admin form** |
| Donation CSV export | ⚠️ | `db.donationsToCsv()` exists but **no API route, no "Export" button** on `/admin/donations` |
| Idempotency key on donation creation | ❌ | Spec calls for an `Idempotency-Key` header so a repeated request doesn't double-charge (Section 8.3). Not implemented — a double-submitted form would currently create two donations |
| Payment reconciliation job | ❌ | Not applicable without a real gateway, but noting it's unbuilt |

---

## 5. Auth & User Accounts

| Item | Status |
|---|---|
| Register / Login / Logout | ✅ |
| Password hashing (bcrypt) | ✅ |
| Session cookies (HttpOnly, signed) | ✅ |
| User dashboard — donation history, totals | ✅ |
| User dashboard — monthly giving list + cancel | ✅ |
| Forgot/reset password | ❌ (see §2) |
| Email verification | ❌ |
| Profile edit page (`/user/profile`) | ❌ | Route doesn't exist — user can't change name/phone/password from the UI |
| Saved/favorited campaigns | ❌ | No favorites API route or UI, though the concept exists in the original spec |
| Notification preferences | ❌ | Not built |
| Account deletion / anonymization | ❌ | Not built |
| Guest-donation-to-account linking | ❌ | Spec: after a guest donates, offer account creation and link past donations by verified email. Not built |

---

## 6. Admin Panel

| Item | Status | Notes |
|---|---|---|
| Separate admin login/session | ✅ | |
| **2FA (TOTP)** | ✅ | Full lifecycle tested with real generated codes — setup, QR, confirm, enforced at login |
| Middleware route guarding | ✅ | |
| Dashboard stats | ✅ | Real totals from real data |
| Campaign CRUD | ✅ | Create, edit, status workflow (Draft→Active→Paused→Completed→Archived) |
| Campaign financials view | ✅ | Admin-only, structurally separate from public API |
| Campaign products view | ✅ | Read-only table (price, sponsored count, limit) |
| **Campaign product CRUD** | ❌ | No way to add/edit/remove a product on a campaign from the UI — products only exist via seed data |
| **Campaign media/gallery upload** | ❌ | No image upload anywhere in the admin — cover images and galleries are placeholders |
| **Campaign milestones/updates/FAQs CRUD** | ❌ | Displayed on the public campaign page, but no admin UI to add/edit them — only exist via seed data |
| Donations table | ✅ | Read-only list |
| Donations — refund action | ❌ | (see §4) |
| Donations — record offline donation | ❌ | (see §4) |
| Donations — CSV export | ❌ | (see §4) |
| Monthly giving table | ✅ | |
| Volunteer applications | ✅ | List only — no status-change UI (Pending→Contacted→Approved etc. exists as a field but no button to change it) |
| Contact inbox | ✅ | List only — no status-change UI (New→Read→Responded etc.) |
| Blog CRUD | ✅ | Full create/edit/delete |
| Events CRUD | ✅ | Full create/edit/delete |
| FAQ CRUD | ✅ | Full create/edit/delete (inline manager) |
| Audit log viewer | ✅ | |
| **Site settings — persistence** | ❌ | Page renders the section structure (General/Contact/Social/Donation/Tax-Legal/SEO/Homepage) but **nothing saves** — `db.updateSiteSettings()` exists, no form is wired to it |
| Admin user management (invite other admins) | ❌ | Only the one seeded Super Admin exists; no UI to create/manage other admin accounts or roles |
| Team/leadership management | ❌ | Not built |
| Transparency documents upload | ❌ | Not built |
| Homepage CMS (reorder featured campaigns, edit hero copy) | ❌ | Homepage content is hardcoded in `page.tsx`, not admin-editable |
| Reports beyond raw tables (charts, trends) | ❌ | Dashboard shows numbers, not charts (spec mentions donation-over-time charts etc.) |
| Sent-email log viewer | ❌ | `db.listEmailLog()` exists, no admin page to view it |

---

## 7. Content Management (Blog/Events/FAQ) — Detail

| Item | Status |
|---|---|
| Blog: create, edit, delete, draft/publish/archive status | ✅ |
| Blog: rich text editor | ❌ (plain `<textarea>`, no formatting) |
| Blog: categories/tags | ❌ (spec mentions `blog_categories`/tags — not in current schema or UI) |
| Blog: audit logging | ✅ (create/update/delete all logged) |
| Events: create, edit, delete, status | ✅ |
| Events: schedule items (multi-session agenda) | ❌ |
| Events: audit logging | ✅ |
| FAQ: create, edit, delete | ✅ |
| FAQ: audit logging | ⚠️ Create is logged; **edit and delete are not** (check `src/app/api/admin/faqs/[id]/route.ts` — no `db.logAudit()` call in `PATCH`/`DELETE`) |

---

## 8. i18n

| Item | Status |
|---|---|
| Language toggle (EN/Hindi) in navbar | ✅ | Actually re-renders on click |
| Translated: nav labels, hero, section headings, footer tagline | ✅ | |
| Translated: campaign/blog/event content | ❌ | Admin-authored content has no translation field at all — this is real schema work, not UI, and matches the spec's own phasing (full Hindi content is Release 2) |
| Locale-prefixed routing (`/hi/campaigns`) | ❌ | Current approach is a client-side toggle, not next-intl-style routing — documented as a deliberate simplification in the code comments |
| Currency formatting (₹ with Indian digit grouping) | ✅ | `formatPaise()` uses `Intl.NumberFormat("en-IN")` |

---

## 9. Infrastructure / Data / Media

| Item | Status | Notes |
|---|---|---|
| Real PostgreSQL connection | ✅ | Prisma schema is pushed to a real Dockerized PostgreSQL database, and Prisma Client is fully integrated. |
| Real payment gateway (Razorpay) | ❌ | No keys available in this environment; integration point is isolated (see §4) |
| Real email provider (SMTP/Resend) | ❌ | `db.sendEmail()` is a log-only mock (see §4) |
| Object storage for images (S3/R2/Cloudinary) | ❌ | Not connected — every image in the app is a CSS gradient placeholder, nothing is actually uploaded or served |
| File upload UI (anywhere in the app) | ❌ | No `<input type="file">` exists — not for campaign covers, gallery, blog covers, or profile photos |
| Search (campaigns/blog/events) | ❌ | No search bar is wired up anywhere, including the search icon in the navbar (it's currently a non-functional button) |
| Pagination | ❌ | All lists (campaigns, blog, donations, admin tables) render everything at once — fine at seed-data scale, will break at real scale |
| Rate limiting | ❌ | Login, register, donation creation, contact form — none are rate-limited |
| CAPTCHA/bot protection | ❌ | Not built |
| SEO: per-page meta tags, OG/Twitter cards | ❌ | Only the root `layout.tsx` sets one static title/description; individual campaign/blog pages don't set their own metadata |
| `sitemap.xml` / `robots.txt` | ❌ | Not generated |
| Structured data (JSON-LD for Organization/Event/Article) | ❌ | Not built |
| Loading skeletons | ❌ | Pages show nothing (blank) while server-rendering rather than a skeleton state |
| Empty states | ⚠️ | Present on campaign listing and donation history; **not** on gallery, blog, events, or admin tables (they just show nothing or a plain "no X yet" line inconsistently) |
| Toasts / confirmation dialogs | ❌ | Destructive actions (e.g. deleting a blog post) use a plain `confirm()` browser dialog, not a styled component |
| Accessibility audit | ⚠️ | Semantic HTML and `aria-label`s used throughout, but no formal audit (contrast checking, screen-reader pass, keyboard-trap testing) has been done |

---

## 10. Testing & DevOps

| Item | Status |
|---|---|
| Unit tests | ❌ None exist |
| Integration tests | ❌ None exist |
| E2E tests (Playwright) | ❌ None exist |
| CI/CD pipeline | ❌ Not configured |
| Dockerfile / docker-compose | ❌ Not created (spec calls for Postgres+Redis compose for local dev) |
| Production deployment config | ❌ Not created |
| Redis / BullMQ (queues) | ❌ Not used — every "job" (receipt generation, email) runs inline/mocked, not queued |

---

## Priority suggestions for the next pass

If picking up from here, roughly in order of "small effort, high visible payoff" → "larger effort":

1. **Contact touchpoints** (your flagged item): wire `/admin/settings` General/Contact tab to `db.updateSiteSettings()`, then render real `tel:`, `mailto:`, and `wa.me/` links on the contact page and footer once values exist. Small, high-visibility.
2. **Social share buttons** on campaign/blog pages (WhatsApp/Facebook/X/Copy Link) — ✅ Done.
3. **Refund + offline donation UI** — backend functions already exist (`db.ts`), just need routes + a small admin form each.
4. **CSV export button** on `/admin/donations` — backend function exists, needs one route + one link.
5. **Forgot/reset password flow** — real gap in core auth, spec calls it out explicitly.
6. **Campaign product/update/milestone/FAQ CRUD** in admin — currently the biggest functional gap, since campaigns can only get *content* (not just settings) from seed data.
7. Receipt PDF generation (`pdfkit` is already installed, unused).
8. Real image upload (even a simple local-disk or base64 stand-in, documented as a placeholder for S3/R2).
