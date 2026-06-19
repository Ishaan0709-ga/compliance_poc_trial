import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Btn, Pill } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { UploadButton } from "@/components/UploadDrawer";
import { Plus, FileText } from "lucide-react";
import { listInvoices, createInvoice } from "@/lib/books.functions";
import { inr, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/books/invoices")({
  head: () => ({ meta: [{ title: "Sales & Invoices — ComplyOS" }] }),
  component: Invoices,
});

function tone(s: string) {
  return s === "paid" ? "done" : s === "overdue" ? "miss" : "pend";
}

function Invoices() {
  const qc = useQueryClient();
  const listFn = useServerFn(listInvoices);
  const createFn = useServerFn(createInvoice);
  const list = useQuery({ queryKey: ["invoices"], queryFn: () => listFn() });

  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    invoice_number: "",
    customer_name: "",
    customer_gstin: "",
    invoice_date: today,
    due_date: "",
    subtotal: 0,
    gst_rate: 18,
    is_export: false,
  });

  const mut = useMutation({
    mutationFn: async () => {
      const gst_amount = +(Number(f.subtotal) * (Number(f.gst_rate) / 100)).toFixed(2);
      const total = +(Number(f.subtotal) + gst_amount).toFixed(2);
      return createFn({ data: { ...f, subtotal: Number(f.subtotal), gst_amount, total, status: "sent" } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      setOpen(false);
      setF({ ...f, invoice_number: "", customer_name: "", customer_gstin: "", subtotal: 0 });
    },
  });

  const rows = list.data?.invoices || [];
  const outstanding = rows.reduce((s: number, r: any) => s + Number(r.balance || 0), 0);
  const totalInvoiced = rows.reduce((s: number, r: any) => s + Number(r.total || 0), 0);
  const gstColl = rows.reduce((s: number, r: any) => s + Number(r.gst_amount || 0), 0);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Sales & Invoices"
        subtitle="Create invoices manually, upload existing ones for AI extraction, or sync from Zoho."
        actions={
          <>
            <UploadButton kind="invoice" label="Upload invoices" />
            <Btn onClick={() => setOpen((s) => !s)}><Plus className="h-4 w-4" /> New invoice</Btn>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(totalInvoiced, { compact: true })} label="Total invoiced" />
        <Kpi value={inr(outstanding, { compact: true })} label="Outstanding" tone={outstanding > 0 ? "dn" : "up"} />
        <Kpi value={String(rows.length)} label="Invoices" />
        <Kpi value={inr(gstColl, { compact: true })} label="GST collected" />
      </div>

      {open && (
        <Card title="New invoice" className="mb-4">
          <div className="grid gap-3 md:grid-cols-3">
            <F label="Invoice #" v={f.invoice_number} on={(v) => setF({ ...f, invoice_number: v })} />
            <F label="Customer" v={f.customer_name} on={(v) => setF({ ...f, customer_name: v })} />
            <F label="Customer GSTIN" v={f.customer_gstin} on={(v) => setF({ ...f, customer_gstin: v })} />
            <F label="Invoice date" v={f.invoice_date} on={(v) => setF({ ...f, invoice_date: v })} type="date" />
            <F label="Due date" v={f.due_date} on={(v) => setF({ ...f, due_date: v })} type="date" />
            <F label="Subtotal (₹)" v={String(f.subtotal)} on={(v) => setF({ ...f, subtotal: Number(v) || 0 })} type="number" />
            <F label="GST rate %" v={String(f.gst_rate)} on={(v) => setF({ ...f, gst_rate: Number(v) || 0 })} type="number" />
          </div>
          {mut.error && <div className="mt-2 text-[12px] text-destructive">{(mut.error as Error).message}</div>}
          <div className="mt-3 flex justify-end gap-2">
            <Btn variant="o" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn onClick={() => mut.mutate()}>{mut.isPending ? "Saving…" : "Create invoice"}</Btn>
          </div>
        </Card>
      )}

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-5 w-5" />}
            title="No invoices yet"
            description="Add your first invoice, upload PDFs for AI extraction, or sync from Zoho Books."
            primary={{ label: "Create invoice", onClick: () => setOpen(true) }}
            secondary={{ label: "Upload invoice PDFs", onClick: () => {} }}
          />
        ) : (
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Invoice</th>
                <th className="pb-2">Customer</th>
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-[11px] text-ink-4">{r.invoice_number}</td>
                  <td className="font-medium text-ink">{r.customer_name}</td>
                  <td className="text-ink-3">{dateShort(r.invoice_date)}</td>
                  <td className="font-mono text-ink-2">{inr(Number(r.total))}</td>
                  <td><Pill tone={tone(r.status)}>{r.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </PortalShell>
  );
}

function F({ label, v, on, type = "text" }: { label: string; v: string; on: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-ink-4">{label}</span>
      <input type={type} value={v} onChange={(e) => on(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-primary" />
    </label>
  );
}
