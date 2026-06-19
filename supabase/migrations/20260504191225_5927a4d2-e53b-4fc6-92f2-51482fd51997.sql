
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor text not null,
  amount numeric(14,2),
  currency text not null default 'INR',
  expense_date date not null default current_date,
  category text,
  source text not null default 'manual',
  gmail_message_id text,
  subject text,
  snippet text,
  status text not null default 'review',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index expenses_user_gmail_msg_uniq
  on public.expenses(user_id, gmail_message_id)
  where gmail_message_id is not null;

create index expenses_user_date_idx on public.expenses(user_id, expense_date desc);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses
  for select to authenticated using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses
  for insert to authenticated with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();
