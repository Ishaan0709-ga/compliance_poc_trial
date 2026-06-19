-- WhatsApp notification queue (architecture only — no live dispatch yet)
CREATE TABLE IF NOT EXISTS public.its_notification (
  notification_id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.its_company_master(company_id) ON DELETE CASCADE,
  compliance_id TEXT REFERENCES public.its_compliance_master(compliance_id),
  due_date DATE,
  recipient TEXT,
  notification_type TEXT NOT NULL,
  message TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending',
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_its_notification_company
  ON public.its_notification(company_id, status, due_date);

GRANT ALL ON public.its_notification TO anon, authenticated;
