# IDFB ERP

Türk KOBİ’leri için üretim seviyesinde, çok şirketli (multi-tenant) SaaS ERP
platformu. Modüler monolit mimari, DDD/temiz mimari prensipleri, olay tabanlı
akışlar ve katı TypeScript ile inşa edilmiştir.

A production-grade, multi-tenant SaaS ERP platform for Turkish SMEs — built as a
modular monolith with DDD / clean-architecture principles, event-driven flows
and strict TypeScript.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Backend**: NestJS, Prisma, PostgreSQL, Redis, BullMQ
- **Frontend**: Next.js 15 (App Router), React 19, TailwindCSS v4
- **Auth**: JWT access + refresh-token rotation, RBAC + permission-based authorization
- **Storage**: MinIO (S3 compatible) · **Email**: Nodemailer
- **Observability**: Winston logging, Prometheus metrics, Terminus health checks
- **API**: REST + Swagger (`/api/v1/docs`)

## Repository Layout

```
apps/
  api/        NestJS REST API (modular monolith)
  web/        Next.js 15 dashboard
packages/
  database/   Prisma schema, migrations, seed, generated client (@idfb/database)
  config/     Shared tsconfig / prettier presets
```

## Domain Modules

Multi-company/branch/warehouse · RBAC (roles, permissions, members) · CRM
(customers, suppliers) · Catalog (products, categories, brands, units, price
lists, barcodes) · Inventory (moving-average cost, stock movements, transfers) ·
Purchasing (orders → receipts → invoices) · Sales (quotations → orders →
invoices) · Finance (cash/bank accounts, collections, payments, expenses,
income) · Accounting (chart of accounts, double-entry journal, trial balance) ·
HR (employees, Turkish statutory payroll, attendance) · Projects & tasks · POS ·
e-Fatura / e-Arşiv / e-İrsaliye · Files · Notifications · Audit logs · Dashboard.

## One-Click Deploy (Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Turquinno-H/idfb)

Clicking the button reads `render.yaml` and provisions the API, PostgreSQL,
Redis/Key-Value and the web frontend on Render's free tier. Every environment
variable is wired by the blueprint, so no post-deploy configuration is needed.
Public app: `https://idfb-web.onrender.com`.

Free-tier services sleep after inactivity (first request after idle takes ~30s),
and free PostgreSQL expires after 30 days.

### Demo login

The seed provisions an administrator of the demo company on first boot:

| E-mail | Password |
| --- | --- |
| `demo@idfb.app` | `Demo1234` |

Override with `SEED_DEMO_EMAIL` / `SEED_DEMO_PASSWORD`, and change the password
from **Ayarlar** after the first login — the hash is written only when the
account is created, so later seed runs never reset it. Anyone can also register
their own company from the **Kayıt Ol** screen; the tax number must be 10–11
digits and unique, and the password needs at least 8 characters with an
upper-case letter, a lower-case letter and a digit.

### How the frontend reaches the API

The browser calls `/api/v1/...` on the web app's own origin, and the route
handler at `apps/web/src/app/api/v1/[...path]` forwards it to the backend. That
target is read per request, so pointing a prebuilt image at a different backend
takes a restart rather than a rebuild, and no CORS grant is involved. It
resolves in order:

1. `API_PROXY_TARGET`, when set.
2. The Render sibling service — a request arriving at `<prefix>-web.onrender.com`
   is forwarded to `https://<prefix>-api.onrender.com`, matching how the
   blueprint names the two services.
3. `http://localhost:3001` for local development.

Set `NEXT_PUBLIC_API_URL` at build time instead if you want the browser to call
the API directly; the API must then list the frontend origin in `CORS_ORIGINS`.
A loopback value is ignored when the page is served from a non-loopback host,
since it could only ever reach the visitor's own machine.

## Getting Started

### With Docker (recommended)

```bash
cp .env.example .env         # set JWT secrets
docker compose up -d --build
# API   → http://localhost:3001/api/v1/docs
# Web   → http://localhost:3000
# MinIO → http://localhost:9001 (minioadmin/minioadmin)
# Mail  → http://localhost:8025
```

### Local development

```bash
pnpm install

# Start Postgres, Redis, MinIO (via docker compose or locally), then:
cp apps/api/.env.example apps/api/.env
pnpm --filter @idfb/database exec prisma migrate deploy
pnpm --filter @idfb/database exec prisma db seed

pnpm dev            # runs api + web via turbo
```

Seed data provisions a demo company (`Demo Ticaret A.Ş.`, tax no `1234567890`),
system roles (Admin, Manager, Accountant, Sales, Warehouse, HR, Viewer), the full
permission catalogue, base currencies (TRY/USD/EUR/GBP) and Turkish VAT rates.

## Verification

```bash
pnpm prisma:validate     # schema validity
pnpm prisma:generate     # Prisma client
pnpm build               # turbo build (database + api + web)
pnpm lint                # eslint across workspace
pnpm --filter @idfb/api test        # unit tests
pnpm --filter @idfb/api test:e2e    # auth lifecycle e2e (needs Postgres + Redis)
```

## Security

Helmet, per-IP rate limiting, global class-validator input validation, Argon2
password hashing, refresh-token rotation with reuse (theft) detection, audit
logging, and tenant isolation enforced at the request-context layer. Prisma’s
parameterised queries mitigate SQL injection; React escaping mitigates XSS.

## External Integrations Requiring Credentials

The e-Transformation module (e-Fatura/e-Arşiv/e-İrsaliye) prepares UBL-TR
document metadata and drives the local document lifecycle; transmission to the
GİB or a private integrator requires paid credentials. MinIO and SMTP hosts are
configurable via environment variables.
