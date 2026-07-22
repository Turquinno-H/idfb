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
