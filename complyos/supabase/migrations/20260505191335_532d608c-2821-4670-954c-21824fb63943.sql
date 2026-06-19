
create table public.zoho_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  region text not null default 'in',
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  organization_id text,
  organization_name text,
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.zoho_connections enable row level security;
create policy "zoho_conn_select_own" on public.zoho_connections for select to authenticated using (auth.uid() = user_id);
create policy "zoho_conn_insert_own" on public.zoho_connections for insert to authenticated with check (auth.uid() = user_id);
create policy "zoho_conn_update_own" on public.zoho_connections for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "zoho_conn_delete_own" on public.zoho_connections for delete to authenticated using (auth.uid() = user_id);
create trigger zoho_connections_set_updated_at before update on public.zoho_connections for each row execute function public.set_updated_at();

create table public.zoho_invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  zoho_invoice_id text not null,
  invoice_number text,
  customer_name text,
  status text,
  invoice_date date,
  due_date date,
  total numeric default 0,
  balance numeric default 0,
  currency text default 'INR',
  raw jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, zoho_invoice_id)
);
alter table public.zoho_invoices enable row level security;
create policy "zoho_inv_select_own" on public.zoho_invoices for select to authenticated using (auth.uid() = user_id);
create policy "zoho_inv_insert_own" on public.zoho_invoices for insert to authenticated with check (auth.uid() = user_id);
create policy "zoho_inv_update_own" on public.zoho_invoices for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "zoho_inv_delete_own" on public.zoho_invoices for delete to authenticated using (auth.uid() = user_id);
create trigger zoho_invoices_set_updated_at before update on public.zoho_invoices for each row execute function public.set_updated_at();
