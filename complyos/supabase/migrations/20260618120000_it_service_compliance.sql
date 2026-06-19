-- IT Service compliance module — master + transactional tables
-- Master tables are seeded; company data is keyed by session company_id

-- Domain Master (Table 1)
CREATE TABLE IF NOT EXISTS public.its_domain_master (
  domain_id TEXT PRIMARY KEY,
  domain_name TEXT NOT NULL
);

-- Compliance Master (Table 3)
CREATE TABLE IF NOT EXISTS public.its_compliance_master (
  compliance_id TEXT PRIMARY KEY,
  domain_id TEXT NOT NULL REFERENCES public.its_domain_master(domain_id),
  sub_domain_id TEXT,
  compliance_name TEXT NOT NULL,
  applicable_law TEXT,
  frequency TEXT NOT NULL,
  risk_level TEXT NOT NULL,
  weight INT NOT NULL DEFAULT 50,
  owner_function TEXT,
  due_logic TEXT,
  description TEXT,
  evidence_types JSONB DEFAULT '[]'::jsonb
);

-- Rule Master (Table 4)
CREATE TABLE IF NOT EXISTS public.its_rule_master (
  rule_id TEXT PRIMARY KEY,
  compliance_id TEXT NOT NULL REFERENCES public.its_compliance_master(compliance_id),
  field TEXT NOT NULL,
  operator TEXT NOT NULL,
  value TEXT NOT NULL
);

-- Company Master (Table 7)
CREATE TABLE IF NOT EXISTS public.its_company_master (
  company_id TEXT PRIMARY KEY,
  company_name TEXT,
  entity_type TEXT,
  industry TEXT DEFAULT 'IT Service',
  revenue_band TEXT,
  employee_count INT DEFAULT 0,
  women_employees INT DEFAULT 0,
  gst_registered BOOLEAN DEFAULT false,
  countries_served JSONB DEFAULT '[]'::jsonb,
  handles_personal_data BOOLEAN DEFAULT false,
  financial_year_start INT DEFAULT 4,
  primary_contact TEXT,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Applicable Compliance (Table 8)
CREATE TABLE IF NOT EXISTS public.its_applicable_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT NOT NULL REFERENCES public.its_compliance_master(compliance_id),
  applicable BOOLEAN NOT NULL DEFAULT true,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (company_id, compliance_id)
);

-- Calendar (Table 6 / 9)
CREATE TABLE IF NOT EXISTS public.its_calendar (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT NOT NULL REFERENCES public.its_compliance_master(compliance_id),
  due_date DATE NOT NULL,
  period TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  owner TEXT,
  risk_level TEXT
);

-- Evidence (Table 5 / 10)
CREATE TABLE IF NOT EXISTS public.its_evidence (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT NOT NULL REFERENCES public.its_compliance_master(compliance_id),
  calendar_item_id TEXT,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  validation_status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scoring (Table 11)
CREATE TABLE IF NOT EXISTS public.its_compliance_score (
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT NOT NULL REFERENCES public.its_compliance_master(compliance_id),
  score INT NOT NULL DEFAULT 0,
  status TEXT,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (company_id, compliance_id)
);

-- Risk alerts
CREATE TABLE IF NOT EXISTS public.its_risk_alert (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Insights
CREATE TABLE IF NOT EXISTS public.its_ai_insight (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- KPI snapshots (Table 12)
CREATE TABLE IF NOT EXISTS public.its_kpi_snapshot (
  company_id TEXT PRIMARY KEY REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  overall_score INT DEFAULT 0,
  open_actions INT DEFAULT 0,
  upcoming_due INT DEFAULT 0,
  critical_risks INT DEFAULT 0,
  overdue_count INT DEFAULT 0,
  evidence_missing INT DEFAULT 0,
  due_this_week INT DEFAULT 0,
  domain_scores JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.its_domain_master TO anon, authenticated;
GRANT SELECT ON public.its_compliance_master TO anon, authenticated;
GRANT SELECT ON public.its_rule_master TO anon, authenticated;
GRANT ALL ON public.its_company_master TO anon, authenticated;
GRANT ALL ON public.its_applicable_compliance TO anon, authenticated;
GRANT ALL ON public.its_calendar TO anon, authenticated;
GRANT ALL ON public.its_evidence TO anon, authenticated;
GRANT ALL ON public.its_compliance_score TO anon, authenticated;
GRANT ALL ON public.its_risk_alert TO anon, authenticated;
GRANT ALL ON public.its_ai_insight TO anon, authenticated;
GRANT ALL ON public.its_kpi_snapshot TO anon, authenticated;

-- Seed domains
INSERT INTO public.its_domain_master (domain_id, domain_name) VALUES
  ('GOV', 'Corporate Governance'),
  ('TAX', 'Taxation'),
  ('HR', 'Human Resource Compliance'),
  ('LEG', 'Legal Compliance'),
  ('SEC', 'Information Security'),
  ('DPP', 'Data Privacy'),
  ('FIN', 'Financial Compliance'),
  ('VEN', 'Vendor Compliance')
ON CONFLICT (domain_id) DO NOTHING;
