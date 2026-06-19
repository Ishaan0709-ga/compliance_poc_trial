
# Real-data overhaul — Founder, Partner, Admin portals

Honest scope note: every page currently ships a hardcoded array (TXN, FEED, ROWS, KPIs). Replacing all of it with real ingestion, AI extraction, live KPIs, a rule-based compliance engine, bank connectors, and partner/admin workflows is **not a single-turn job**. I'll ship it in phases — each phase is independently usable.

## Phase 1 — Foundation (this turn)
**Goal:** kill dummy data, stand up the database, give every page real empty states + ingestion entry points.

- Migration: tables for `company_profile`, `transactions`, `invoices`, `bills`, `bank_accounts`, `bank_statements_raw`, `documents` (uploads), `compliance_tasks`, `kpi_snapshots`, `extraction_jobs`. All RLS-scoped to `auth.uid()`, with GRANTs.
- Storage bucket `ingest` (private) for uploaded PDFs/CSVs/XLSX/images.
- Replace every founder page's hardcoded array with `useQuery` against a server fn → returns `[]` initially → renders a real empty state with a clear CTA ("Connect Zoho", "Upload statement", "Import from Gmail", "Add manually").
- Universal **Upload & Ingest** drawer (drag-drop → Storage → `extraction_jobs` row → status pill).
- Manual entry forms (invoice, expense, bank txn) with zod validation.

## Phase 2 — AI extraction pipeline
- Server fn `extractDocument(jobId)` using Lovable AI (`google/gemini-3-flash-preview`) with structured output → parses uploaded bank statement / invoice / receipt → writes normalised rows to `transactions` / `invoices` / `bills`.
- Background-style polling UI on the upload drawer.
- Gmail/Drive ingestion: server fn lists last 90d of attachments matching invoice/receipt patterns via existing connectors → queues extraction jobs.
- Zoho sync extended: pull bills, expenses, bank txns (not just invoices).

## Phase 3 — Live derivations
- KPI rollups computed from `transactions` (revenue, expenses, net, runway, cash, AR, AP, GST collected/paid) — materialised via `kpi_snapshots` or computed on read.
- Books, P&L chart, Banking feed, Invoices, Expenses, Payroll all read from these tables in real time (Realtime subscription on `transactions`).
- Calendar shows real upcoming items from `compliance_tasks` + invoice due dates.

## Phase 4 — Rule-based compliance engine
- `company_profile` questionnaire (entity type, state, GSTIN, PAN, headcount, turnover band, registrations: PF/ESI/PT/MSME/Startup India).
- Deterministic rule set generates recurring `compliance_tasks` (GSTR-1, GSTR-3B, TDS 26Q, PF ECR, PT, ROC AOC-4/MGT-7, advance tax, etc.) with due dates + penalty info.
- Daily cron via `/api/public/cron/compliance` regenerates the next 90 days.
- Regulatory feed (already live) cross-references into the calendar.

## Phase 5 — Bank connectors
- Setu / Finbox / Plaid-India evaluation. Needs a paid sandbox + user-provided API keys. I'll surface a "Connect bank" CTA that requests the secret when the user is ready — not building the integration speculatively.

## Phase 6 — Partner & Admin portals
- Partner: assignments / deliverables / earnings / chat → tables `partner_assignments`, `partner_deliverables`, `partner_payouts`, `messages` (Realtime).
- Admin: customers / orders / SLA / catalogue / BI / intake / partners → tables + dashboards aggregated from the founder data above.

## Technical details
- All server logic via `createServerFn` (not edge functions). Files under `src/lib/*.functions.ts`.
- Bearer-attached, `requireSupabaseAuth` on every fn.
- Realtime on `transactions`, `compliance_tasks`, `extraction_jobs`, `messages`.
- AI extraction uses Lovable AI Gateway (`LOVABLE_API_KEY` already present) — no extra keys.
- Empty states use existing `ui-kit` `Card` / `Banner` / `Btn` so no design drift.

## What I'll do right now if you approve
Phase 1 in full: migration, storage bucket, ~15 server fns (CRUD + list), upload drawer component, manual-entry forms, and every founder page rewritten to fetch real data with proper empty states. This alone is a large turn (~25 file writes + 1 migration) and will take a few minutes.

Reply **"go phase 1"** to proceed, or tell me to re-scope (e.g. "founder only first", "skip manual entry, uploads only").
