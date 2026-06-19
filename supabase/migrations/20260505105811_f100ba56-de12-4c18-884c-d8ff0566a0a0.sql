
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  emp_code TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT,
  pan TEXT,
  doj DATE,
  ctc NUMERIC NOT NULL DEFAULT 0,
  bank_name TEXT,
  bank_account TEXT,
  bank_ifsc TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_select_own" ON public.employees FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "employees_insert_own" ON public.employees FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employees_update_own" ON public.employees FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employees_delete_own" ON public.employees FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER employees_set_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vault_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  s3_key TEXT NOT NULL,
  size_bytes BIGINT,
  mime_type TEXT,
  doc_type TEXT,
  category TEXT,
  ai_confidence NUMERIC,
  ai_summary TEXT,
  extracted JSONB,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vault_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vault_select_own" ON public.vault_documents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "vault_insert_own" ON public.vault_documents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vault_update_own" ON public.vault_documents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "vault_delete_own" ON public.vault_documents FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER vault_set_updated_at BEFORE UPDATE ON public.vault_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
