-- Production notification history (WhatsApp + future channels)
CREATE TABLE IF NOT EXISTS public.its_notification_history (
  notification_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  compliance_id TEXT REFERENCES public.its_compliance_master(compliance_id),
  recipient_number TEXT NOT NULL,
  message_type TEXT NOT NULL,
  message_body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_status TEXT NOT NULL DEFAULT 'queued',
  twilio_message_sid TEXT,
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_its_notification_history_user
  ON public.its_notification_history(user_id, sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_its_notification_history_status
  ON public.its_notification_history(delivery_status, sent_at DESC);

GRANT ALL ON public.its_notification_history TO anon, authenticated;

-- Extend company profile for notification preferences
ALTER TABLE public.its_company_master
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+91',
  ADD COLUMN IF NOT EXISTS notification_enabled BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT true;
