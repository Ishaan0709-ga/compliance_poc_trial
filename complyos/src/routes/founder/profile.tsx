import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Btn, Pill, Kpi } from "@/components/ui-kit";
import { Building2, CheckCircle2, Download, CreditCard, FileText, ArrowRight } from "lucide-react";
import { getCompanyProfile, saveCompanyProfile, regenerateComplianceTasks } from "@/lib/profile.functions";
import { listInvoices } from "@/lib/books.functions";
import { inr, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/profile")({
  head: () => ({ meta: [{ title: "Company Profile — ComplyOS" }] }),
  component: Profile,
});

const ENTITY_TYPES = [
  { v: "private_limited", l: "Private Limited" },
  { v: "llp", l: "LLP" },
  { v: "opc", l: "One Person Company" },
  { v: "partnership", l: "Partnership" },
  { v: "proprietorship", l: "Proprietorship" },
  { v: "public_limited", l: "Public Limited" },
];
const TURNOVER = ["<40L", "40L-1.5Cr", "1.5-5Cr", "5-50Cr", "50Cr+"];
const REGS = [
  { k: "pf", l: "PF (EPFO)" },
  { k: "esi", l: "ESI" },
  { k: "pt", l: "Professional Tax" },
  { k: "msme", l: "MSME / Udyam" },
  { k: "startup_india", l: "DPIIT Startup India" },
  { k: "iec", l: "IEC (Imports/Exports)" },
];

const COMPLYOS_INVOICES = [
  { id: "INV-2026-0481", date: "02 May 2026", svc: "GSTR-3B Filing (Apr)", amt: 1499, status: "paid" },
  { id: "INV-2026-0455", date: "20 Apr 2026", svc: "Trademark — Class 9", amt: 6999, status: "paid" },
  { id: "INV-2026-0440", date: "12 Apr 2026", svc: "Annual ROC Filing", amt: 7999, status: "due" },
  { id: "INV-2026-0421", date: "01 Apr 2026", svc: "DIR-3 KYC", amt: 1998, status: "paid" },
];

function Profile() {
  const qc = useQueryClient();
  const getFn = useServerFn(getCompanyProfile);
  const saveFn = useServerFn(saveCompanyProfile);
  const regenFn = useServerFn(regenerateComplianceTasks);
  const q = useQuery({ queryKey: ["company-profile"], queryFn: () => getFn() });

  const [tab, setTab] = useState<"profile" | "billing">("profile");

  const [f, setF] = useState<any>({
    legal_name: "", entity_type: "private_limited", state: "", pan: "", gstin: "", cin: "",
    incorporation_date: "", headcount: 0, turnover_band: "<40L", registrations: {},
  });

  useEffect(() => {
    if (q.data?.profile) setF((prev: any) => ({ ...prev, ...q.data.profile, registrations: q.data.profile.registrations || {} }));
  }, [q.data]);

  const save = useMutation({
    mutationFn: async () => saveFn({ data: { ...f, headcount: Number(f.headcount) || 0 } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["company-profile"] }),
  });
  const regen = useMutation({
    mutationFn: async () => regenFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-tasks"] }),
  });

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Company profile"
        subtitle="Drives your compliance calendar, tax filings and reports. Update as you grow."
        actions={
          tab === "profile" ? (
            <>
              <Btn variant="o" onClick={() => regen.mutate()} disabled={!q.data?.profile || regen.isPending}>
                {regen.isPending ? "Generating…" : "Regenerate compliance calendar"}
              </Btn>
              <Btn onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Saving…" : save.isSuccess ? <><CheckCircle2 className="h-4 w-4" /> Saved</> : "Save profile"}
              </Btn>
            </>
          ) : (
            <Btn variant="o"><CreditCard className="h-4 w-4" /> Manage payment method</Btn>
          )
        }
      />

      <div className="mb-5 flex gap-1 rounded-lg border border-border bg-surface-2 p-1 w-fit">
        <button
          onClick={() => setTab("profile")}
          className={`rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors ${tab === "profile" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"}`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("billing")}
          className={`rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors ${tab === "billing" ? "bg-surface text-ink shadow-sm" : "text-ink-3 hover:text-ink"}`}
        >
          Billing & Invoices
        </button>
      </div>

      {tab === "profile" ? (
        <>
          <Card title="Entity">
            <div className="grid gap-3 md:grid-cols-2">
              <F l="Legal name" v={f.legal_name || ""} on={(v) => setF({ ...f, legal_name: v })} />
              <Sel l="Entity type" v={f.entity_type} on={(v) => setF({ ...f, entity_type: v })} opts={ENTITY_TYPES.map((e) => ({ v: e.v, l: e.l }))} />
              <F l="State" v={f.state || ""} on={(v) => setF({ ...f, state: v })} placeholder="Karnataka" />
              <F l="Incorporation date" type="date" v={f.incorporation_date || ""} on={(v) => setF({ ...f, incorporation_date: v })} />
              <F l="PAN" v={f.pan || ""} on={(v) => setF({ ...f, pan: v.toUpperCase() })} />
              <F l="CIN" v={f.cin || ""} on={(v) => setF({ ...f, cin: v.toUpperCase() })} />
              <F l="GSTIN" v={f.gstin || ""} on={(v) => setF({ ...f, gstin: v.toUpperCase() })} placeholder="29ABCDE1234F1Z5" />
              <F l="Headcount" type="number" v={String(f.headcount ?? 0)} on={(v) => setF({ ...f, headcount: Number(v) || 0 })} />
              <Sel l="Turnover band" v={f.turnover_band || "<40L"} on={(v) => setF({ ...f, turnover_band: v })} opts={TURNOVER.map((t) => ({ v: t, l: t }))} />
            </div>
          </Card>

          <Card title="Registrations" className="mt-4">
            <div className="grid gap-2 md:grid-cols-3">
              {REGS.map((r) => {
                const on = !!f.registrations?.[r.k];
                return (
                  <button key={r.k} onClick={() => setF({ ...f, registrations: { ...(f.registrations || {}), [r.k]: !on } })}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      on ? "border-primary-border bg-primary-muted/60" : "border-border bg-surface-2 hover:bg-surface-3"
                    }`}>
                    <span className="text-[13px] font-medium text-ink">{r.l}</span>
                    {on ? <Pill tone="done">enabled</Pill> : <Pill tone="n">off</Pill>}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-[11.5px] text-ink-4">
              After saving, click <strong>Regenerate compliance calendar</strong> to refresh GSTR, TDS, PF, PT, ROC and ITR due dates for the next 6 months.
            </p>
          </Card>

          {save.error && <div className="mt-3 text-[12px] text-destructive">{(save.error as Error).message}</div>}
          {regen.data && <div className="mt-3 text-[12px] text-success">Generated/updated {regen.data.created} compliance tasks.</div>}
        </>
      ) : (
        <BillingTab />
      )}
    </PortalShell>
  );
}

function BillingTab() {
  const invFn = useServerFn(listInvoices);
  const sales = useQuery({ queryKey: ["sales-invoices"], queryFn: () => invFn() });
  const rows = sales.data?.invoices || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(7999)} label="Outstanding" tone="dn" change="due in 5 days" />
        <Kpi value={inr(142000, { compact: true })} label="Spent YTD" />
        <Kpi value="HDFC ••4218" label="Default card" />
        <Kpi value="Pro" label="Plan" change="renews 14 Mar 2027" />
      </div>

      <Card title="ComplyOS invoices">
        <div className="divide-y divide-border">
          {COMPLYOS_INVOICES.map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="font-mono text-[11px] text-ink-4">{i.id}</div>
                <div className="text-[13px] font-medium text-ink">{i.svc}</div>
                <div className="text-[11px] text-ink-4">{i.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[14px] font-semibold text-ink">{inr(i.amt)}</div>
                <Pill tone={i.status === "paid" ? "done" : "miss"}>{i.status === "paid" ? "Paid" : "Due"}</Pill>
                <Btn variant="g"><Download className="h-3.5 w-3.5" /></Btn>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Sales invoices" action={
        <Link to="/founder/books/invoices" className="inline-flex items-center gap-1 text-[12px] font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      }>
        {sales.isLoading ? (
          <div className="py-6 text-center text-[12px] text-ink-4">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FileText className="h-5 w-5 text-ink-4" />
            <p className="text-[13px] text-ink-3">No sales invoices yet.</p>
            <Link to="/founder/books/invoices" className="text-[12px] font-medium text-primary hover:underline">
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {rows.slice(0, 5).map((i: any) => (
              <div key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                <div>
                  <div className="font-mono text-[11px] text-ink-4">{i.invoice_number}</div>
                  <div className="text-[13px] font-medium text-ink">{i.customer_name}</div>
                  <div className="text-[11px] text-ink-4">{dateShort(i.invoice_date)} · {i.status}</div>
                </div>
                <div className="text-[14px] font-semibold text-ink">{inr(Number(i.total))}</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function F({ l, v, on, type = "text", placeholder }: { l: string; v: string; on: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-4">{l}</span>
      <input type={type} value={v} placeholder={placeholder} onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary" />
    </label>
  );
}
function Sel({ l, v, on, opts }: { l: string; v: string; on: (v: string) => void; opts: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-4">{l}</span>
      <select value={v} onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary">
        {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
