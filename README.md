# Shri Nityanikunj Trust — Website & Giving Platform

A Next.js application for the Trust’s public website, online donations, and admin-managed content. It uses PostgreSQL through Prisma, Razorpay for one-time payments, SMTP for email, and optional S3-compatible object storage and translation providers.

> **Deployment note:** A successful build does not configure external services. Before accepting live donations, configure the production environment variables below and verify the live Razorpay webhook, payment confirmation, receipt email, database, and storage.

## Contents

- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [External service setup](#external-service-setup)
- [Available features](#available-features)
- [Useful commands](#useful-commands)

## Getting started

Requirements: Node.js compatible with the installed Next.js version, npm, and a PostgreSQL database.

```bash
npm install
cp .env.example .env
```

Fill in at least `DATABASE_URL` and `AUTH_SECRET` in `.env`. This repository currently contains a Prisma schema but no committed migration history or configured seed command. For local development, create an initial migration from the schema, then start the app:

```bash
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Commit reviewed migrations and apply them with `npx prisma migrate deploy` during deployment. Do not use `prisma db push` as a substitute for a production migration workflow.

`prisma/seed.ts` can create `admin@nityanikunj.org` when `ADMIN_BOOTSTRAP_PASSWORD` is set, but this repository does not currently configure a Prisma seed command or include a TypeScript seed runner. Configure an approved seed invocation in your deployment/setup workflow before relying on it; do not assume the admin account is automatically created.

Never use a demo password or the development fallback signing secret on a public deployment. Keep `.env` out of version control and configure production secrets in the hosting provider’s environment settings.

## Environment variables

See [`.env.example`](.env.example) for a commented template. The application reads these exact names:

| Variable | Required? | Used for |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection used by Prisma. |
| `AUTH_SECRET` | Yes in production | Signs user and admin session cookies. Use a strong random value. |
| `RAZORPAY_KEY_ID` | For donations | Razorpay API key ID used for order creation and checkout. |
| `RAZORPAY_KEY_SECRET` | For donations | Razorpay API secret used for payment verification. |
| `RAZORPAY_WEBHOOK_SECRET` | For webhook confirmation | Verifies Razorpay webhook signatures. Set the same value in Razorpay and hosting. |
| `EMAIL_HOST` | For real email delivery | SMTP hostname. For Resend, use `smtp.resend.com`. |
| `EMAIL_PORT` | For real email delivery | SMTP port. Resend supports `465` for SSL; the app defaults to `465`. |
| `EMAIL_USER` | For real email delivery | SMTP username. For Resend, use `resend`. |
| `EMAIL_PASSWORD` | For real email delivery | SMTP password. For Resend, use your Resend API key. |
| `EMAIL_FROM` | Recommended | Sender address. Use an address on a domain verified with your mail provider. |
| `S3_ENDPOINT` | For image uploads | S3-compatible endpoint. For R2, use the account’s R2 S3 API endpoint. |
| `S3_ACCESS_KEY_ID` | For image uploads | S3/R2 access key ID. |
| `S3_SECRET_ACCESS_KEY` | For image uploads | Matching S3/R2 secret access key. |
| `S3_BUCKET_NAME` | For image uploads | Destination bucket name. |
| `S3_PUBLIC_URL` | For public images | Public bucket URL or connected custom domain used to form image URLs. |
| `GOOGLE_TRANSLATE_API_KEY` | Optional | Google Cloud Translation provider. Tried first when configured. |
| `LIBRETRANSLATE_URL` | Optional | LibreTranslate server URL; used if Google is absent or fails. |
| `LIBRETRANSLATE_API_KEY` | Optional | API key for LibreTranslate instances that require one. |
| `NEXT_PUBLIC_BASE_URL` | Optional | Production site URL used in newsletter unsubscribe links. Defaults to `https://shrinityanikunjtrust.org`. |
| `ADMIN_BOOTSTRAP_PASSWORD` | Setup only | Password used by the seed script when creating the first admin. |
| `NODE_ENV` | Hosting-managed | Determines development/production behavior. Normally set by the platform. |

`REDIS_URL`, `DIRECT_URL`, and the old `STORAGE_*` names are not read by the current application. Translation uses PostgreSQL and a process-memory cache; Redis credentials are not needed. Uploads use the `S3_*` names above.

## External service setup

### Razorpay — one-time donations

1. Generate API keys in the Razorpay Dashboard. Use **Test Mode** while testing and **Live Mode** only after the account is ready to accept payments.
2. Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to the hosting environment.
3. Configure a webhook pointing to `https://your-domain.example/api/webhooks/razorpay`.
4. Subscribe to `payment.captured` and `payment.failed`. Set a webhook secret and copy the same value to `RAZORPAY_WEBHOOK_SECRET` in hosting.
5. Complete a test-mode donation and verify that the donation status, receipt number, and donor email are correct before switching to live keys.

The donor-facing checkout creates an order through Razorpay. Payment verification and the webhook update the donation; the successful payment flow generates a receipt number and sends the receipt email when SMTP is configured.

### Resend — email via SMTP

The app uses Nodemailer SMTP, not Resend’s HTTP API. Use:

```text
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASSWORD=<your Resend API key>
EMAIL_FROM=<sender address on your verified domain>
```

Verify the sending domain in Resend and use a permitted sender address. Without SMTP credentials, some development paths only log a simulated email; that does not deliver mail to a donor.

### Cloudflare R2 or another S3-compatible store — image uploads

Create a bucket and an API token with only the object permissions this app needs. For Cloudflare R2, copy its S3 endpoint and access key pair, connect a public custom domain (recommended for production), and configure all five `S3_*` variables. The app returns image URLs using `S3_PUBLIC_URL`; the corresponding bucket/domain must serve those objects publicly for public pages to display them.

### Translations — Google or LibreTranslate

The active translated content locales are Hindi (`hi`), Telugu (`te`), and Tamil (`ta`), with English as the source. Configure Google, LibreTranslate, or both. If both are set, Google is attempted first and LibreTranslate is used if Google fails. A LibreTranslate URL may point to a self-hosted instance or a hosted service; availability, request limits, and any key requirements depend on that instance.

## Available features

### Public website

Campaigns, events, blog posts, FAQs, gallery, team and transparency information, legal pages, contact form, volunteer form, newsletter signup, user registration/login, and donation checkout. Admin-authored public content is read from the database and translated content is served when available.

### Admin

Admin login and authorization, optional TOTP two-factor authentication, campaign and content management, donation records, volunteer and contact inquiry management, site settings, translation management, and audit logging. Site Settings values for contact email, phone, address, map URL, WhatsApp, and footer social links feed the corresponding public areas where wired.

### One-time donations

Razorpay order creation, payment verification, webhook processing, donation status updates, receipt-number creation, and receipt email are implemented. Actual payment acceptance and email delivery depend on correct production credentials, webhook setup, database connectivity, and SMTP configuration.

### Recurring donations

Recurring/subscription payment infrastructure is not implemented in the current database layer. The monthly giving UI/API should not be treated as a live recurring billing feature until a subscription provider flow is implemented and verified.

### Translation

Stored field translations are generated for registered content text fields on save when a provider is configured. The admin Translations page can also backfill missing translations for existing content. Machine translations should be reviewed, especially legal and statutory text.

## Useful commands

```bash
npm run dev             # Start the local development server
npm run build           # Compile the production application
npm run start           # Start the production server after a build
npm run lint            # Run ESLint
npx prisma generate     # Generate Prisma Client
npx prisma migrate deploy  # Apply committed migrations
```

## Project structure

```text
src/app/                 Public pages, admin pages, and API route handlers
src/components/          Shared public and admin UI
src/lib/db.ts            Prisma-backed data access and domain operations
src/lib/auth.ts          Signed user/admin sessions
src/lib/translation.ts   Translation providers and content translation registry
prisma/schema.prisma     PostgreSQL data model
prisma/migrations/       Database migrations
prisma/seed.ts           Optional initial-admin bootstrap
```
