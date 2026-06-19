import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Btn, Pill } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { UploadButton } from "@/components/UploadDrawer";
import { Landmark, Plus, Sparkles } from "lucide-react";
import { listBankAccounts, createBankAccount, listTransactions } from "@/lib/books.functions";
import { inr, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/books/banking")({
  head: () => ({ meta: [{ title: "Banking — ComplyOS" }] }),
  component: Banking,
});

function Banking() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBankAccounts);
  const createFn = useServerFn(createBankAccount);
  const txnFn = useServerFn(listTransactions);

  const accounts = useQuery({ queryKey: ["bank-accounts"], queryFn: () => listFn() });
  const feed = useQuery({ queryKey: ["transactions", "bank"], queryFn: () => txnFn({ data: { limit: 30 } }) });

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", bank: "", account_number_last4: "", account_type: "current" as const, opening_balance: 0 });

  const addMut = useMutation({
    mutationFn: async () => createFn({ data: { ...form, opening_balance: Number(form.opening_balance) || 0 } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bank-accounts"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      setAdding(false);
      setForm({ name: "", bank: "", account_number_last4: "", account_type: "current", opening_balance: 0 });
    },
  });

  const accts = accounts.data?.accounts || [];
  const feedRows = (feed.data?.transactions || []).filter((t: any) => !!t.bank_account_id);
  const totalBalance = accts.reduce((s: number, a: any) => s + Number(a.current_balance || 0), 0);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Banking"
        subtitle="Add accounts manually, upload statements, or sync from Zoho — all transactions land in one ledger."
        actions={
          <>
            <Btn variant="o" onClick={() => setAdding((s) => !s)}><Plus className="h-4 w-4" /> Add account</Btn>
            <UploadButton kind="bank_statement" label="Upload statement" />
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(totalBalance, { compact: true })} label="Total balance" tone={totalBalance > 0 ? "up" : "neu"} />
        <Kpi value={String(accts.length)} label="Bank accounts" />
        <Kpi value={String(feedRows.length)} label="Recent transactions" />
        <Kpi value="—" label="Auto-match rate" change="needs AI extraction" />
      </div>

      {adding && (
        <Card title="New bank account" className="mb-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Account name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="HDFC Current" />
            <Field label="Bank" value={form.bank} onChange={(v) => setForm({ ...form, bank: v })} placeholder="HDFC Bank" />
            <Field label="Last 4 digits" value={form.account_number_last4} onChange={(v) => setForm({ ...form, account_number_last4: v })} placeholder="4218" />
            <Field label="Opening balance (₹)" value={String(form.opening_balance)} onChange={(v) => setForm({ ...form, opening_balance: Number(v) || 0 })} placeholder="0" />
          </div>
          {addMut.error && <div className="mt-2 text-[12px] text-destructive">{(addMut.error as Error).message}</div>}
          <div className="mt-3 flex justify-end gap-2">
            <Btn variant="o" onClick={() => setAdding(false)}>Cancel</Btn>
            <Btn onClick={() => addMut.mutate()}>{addMut.isPending ? "Saving…" : "Save account"}</Btn>
          </div>
        </Card>
      )}

      {accts.length === 0 ? (
        <EmptyState
          icon={<Landmark className="h-5 w-5" />}
          title="No bank accounts yet"
          description="Add a bank account to start tracking balances and reconciling transactions."
          primary={{ label: "Add bank account", onClick: () => setAdding(true) }}
          secondary={{ label: "Upload a bank statement", onClick: () => {} }}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {accts.map((a: any) => (
            <Card key={a.id}>
              <div className="flex items-center gap-2 text-ink-3"><Landmark className="h-4 w-4" /><span className="text-[11px] capitalize">{a.account_type || "account"}</span></div>
              <div className="mt-2 text-[14px] font-medium text-ink">{a.name}</div>
              <div className="text-[11px] text-ink-4">{a.bank}{a.account_number_last4 ? ` · •• ${a.account_number_last4}` : ""}</div>
              <div className="mt-3 font-mono text-[20px] font-semibold tracking-[-0.02em] text-ink">{inr(Number(a.current_balance), { compact: true })}</div>
            </Card>
          ))}
        </div>
      )}

      <Card title="Live transaction feed" className="mt-4" action={<Pill tone="infra"><Sparkles className="h-3 w-3" /> live</Pill>}>
        {feedRows.length === 0 ? (
          <div className="py-6 text-center text-[12px] text-ink-4">
            Upload a bank statement to populate transactions here.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {feedRows.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-ink">{t.description}</div>
                  <div className="text-[11px] text-ink-4">{dateShort(t.txn_date)} · {t.status}</div>
                </div>
                <span className={`font-mono text-[13px] font-semibold ${t.direction === "in" ? "text-success" : "text-destructive"}`}>
                  {t.direction === "in" ? "+" : "−"} {inr(Math.abs(Number(t.amount)))}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-4">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary"
      />
    </label>
  );
}
