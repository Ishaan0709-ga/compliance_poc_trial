
-- ============ Company profile ============
CREATE TABLE public.company_profile (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  legal_name TEXT,
  entity_type TEXT,                 -- 'private_limited' | 'llp' | 'opc' | 'partnership' | 'proprietorship'
  state TEXT,
  pan TEXT,
  gstin TEXT,
  cin TEXT,
  incorporation_date DATE,
  headcount INT DEFAULT 0,
  turnover_band TEXT,               -- '<40L' | '40L-1.5Cr' | '1.5-5Cr' | '5-50Cr' | '50Cr+'
  registrations JSONB DEFAULT '{}'::jsonb, -- {pf,esi,pt,msme,startup_india,iec}
  fiscal_year_start INT DEFAULT 4,
  base_currency TEXT DEFAULT 'INR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_profile TO authenticated;
GRANT ALL ON public.company_profile TO service_role;
ALTER TABLE public.company_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.company_profile FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Bank accounts ============
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bank TEXT,
  account_number_last4 TEXT,
  ifsc TEXT,
  account_type TEXT,                -- 'current' | 'savings' | 'eefc' | 'cc' | 'wallet'
  currency TEXT NOT NULL DEFAULT 'INR',
  opening_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual' | 'zoho' | 'statement' | 'plaid' | 'setu'
  source_ref TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.bank_accounts(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bank_accounts TO authenticated;
GRANT ALL ON public.bank_accounts TO service_role;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bank accts" ON public.bank_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Documents (raw uploads) ============
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,               -- 'bank_statement' | 'invoice' | 'bill' | 'receipt' | 'contract' | 'other'
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,       -- bucket: ingest
  source TEXT NOT NULL DEFAULT 'upload', -- 'upload' | 'gmail' | 'gdrive' | 'zoho'
  source_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.documents(user_id, kind, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own docs" ON public.documents FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Extraction jobs ============
CREATE TABLE public.extraction_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,               -- matches documents.kind
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued'|'running'|'done'|'failed'
  model TEXT,
  rows_extracted INT DEFAULT 0,
  error TEXT,
  result JSONB,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.extraction_jobs(user_id, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.extraction_jobs TO authenticated;
GRANT ALL ON public.extraction_jobs TO service_role;
ALTER TABLE public.extraction_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own jobs" ON public.extraction_jobs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Transactions (unified ledger) ============
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE SET NULL,
  txn_date DATE NOT NULL,
  description TEXT NOT NULL,
  counterparty TEXT,
  amount NUMERIC(18,2) NOT NULL,     -- signed: +income / -expense
  currency TEXT NOT NULL DEFAULT 'INR',
  direction TEXT NOT NULL,           -- 'in' | 'out'
  category TEXT,                     -- 'revenue'|'cogs'|'opex_payroll'|'opex_software'|'opex_cloud'|'tax_gst'|'tax_tds'|...
  subcategory TEXT,
  gst_rate NUMERIC(5,2),
  gst_amount NUMERIC(18,2),
  status TEXT NOT NULL DEFAULT 'posted', -- 'pending'|'posted'|'reconciled'|'duplicate'
  matched_invoice_id UUID,
  matched_bill_id UUID,
  source TEXT NOT NULL DEFAULT 'manual', -- 'manual'|'statement'|'zoho'|'gmail'|'gdrive'|'plaid'|'setu'
  source_ref TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  ai_confidence NUMERIC(4,3),
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.transactions(user_id, txn_date DESC);
CREATE INDEX ON public.transactions(user_id, category);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own txns" ON public.transactions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Invoices (sales/AR) ============
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_gstin TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2),
  gst_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total NUMERIC(18,2) NOT NULL,
  balance NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft'|'sent'|'paid'|'overdue'|'void'
  is_export BOOLEAN NOT NULL DEFAULT false,
  irn TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  line_items JSONB DEFAULT '[]'::jsonb,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, invoice_number)
);
CREATE INDEX ON public.invoices(user_id, invoice_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT ALL ON public.invoices TO service_role;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own invoices" ON public.invoices FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Bills (purchase/AP) ============
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_number TEXT,
  vendor_name TEXT NOT NULL,
  vendor_gstin TEXT,
  bill_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC(18,2) NOT NULL DEFAULT 0,
  gst_rate NUMERIC(5,2),
  gst_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  tds_amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  total NUMERIC(18,2) NOT NULL,
  balance NUMERIC(18,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  category TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- 'open'|'paid'|'overdue'|'void'
  source TEXT NOT NULL DEFAULT 'manual',
  source_ref TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  line_items JSONB DEFAULT '[]'::jsonb,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON public.bills(user_id, bill_date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bills TO authenticated;
GRANT ALL ON public.bills TO service_role;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bills" ON public.bills FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ Compliance tasks ============
CREATE TABLE public.compliance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_code TEXT NOT NULL,            -- 'GSTR-1' | 'GSTR-3B' | 'TDS-26Q' | 'PF-ECR' | 'PT' | 'ROC-AOC4' | ...
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,             -- 'GST'|'Income Tax'|'Labour'|'MCA'|'RBI'
  authority TEXT,
  period TEXT,                        -- 'May 2026', 'FY 2025-26', 'Q1 FY26'
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending'|'in_progress'|'filed'|'late'|'skipped'
  penalty_info TEXT,
  filed_on DATE,
  acknowledgement TEXT,
  document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, rule_code, period)
);
CREATE INDEX ON public.compliance_tasks(user_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_tasks TO authenticated;
GRANT ALL ON public.compliance_tasks TO service_role;
ALTER TABLE public.compliance_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own compliance" ON public.compliance_tasks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ KPI snapshots ============
CREATE TABLE public.kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics JSONB NOT NULL,             -- {revenue, expenses, net, cash, ar, ap, gst_collected, gst_paid, runway_months}
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_start, period_end)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_snapshots TO authenticated;
GRANT ALL ON public.kpi_snapshots TO service_role;
ALTER TABLE public.kpi_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own kpis" ON public.kpi_snapshots FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ updated_at trigger ============
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['company_profile','bank_accounts','transactions','invoices','bills','compliance_tasks'])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END$$;

-- ============ Realtime ============
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.extraction_jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.compliance_tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bills;
