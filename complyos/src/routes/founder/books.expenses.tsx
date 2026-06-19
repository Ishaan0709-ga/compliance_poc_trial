import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Btn, Pill } from "@/components/ui-kit";
import { EmptyState } from "@/components/EmptyState";
import { UploadButton } from "@/components/UploadDrawer";
import { Plus, Receipt } from "lucide-react";
import { listBills, createBill } from "@/lib/books.functions";
import { inr, dateShort } from "@/lib/format";

export const Route = createFileRoute("/founder/books/expenses")({
  head: () => ({ meta: [{ title: "Expenses & Bills — ComplyOS" }] }),
  component: Expenses,
});

function Expenses() {
  const qc = useQueryClient();
  const listFn = useServerFn(listBills);
  const createFn = useServerFn(createBill);
  const list = useQuery({ queryKey: ["bills"], queryFn: () => listFn() });

  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [f, setF] = useState({
    bill_number: "", vendor_name: "", vendor_gstin: "", bill_date: today, due_date: "",
    subtotal: 0, gst_rate: 18, tds_amount: 0, category: "",
  });

  const mut = useMutation({
    mutationFn: async () => {
      const gst_amount = +(Number(f.subtotal) * (Number(f.gst_rate) / 100)).toFixed(2);
      const total = +(Number(f.subtotal) + gst_amount - Number(f.tds_amount)).toFixed(2);
      return createFn({ data: { ...f, subtotal: Number(f.subtotal), gst_amount, total, status: "open" } });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bills"] });
      qc.invalidateQueries({ queryKey: ["kpis"] });
      setOpen(false);
      setF({ ...f, bill_number: "", vendor_name: "", vendor_gstin: "", subtotal: 0, category: "" });
    },
  });

  const rows = list.data?.bills || [];
  const totalSpend = rows.reduce((s: number, r: any) => s + Number(r.total || 0), 0);
  const outstanding = rows.reduce((s: number, r: any) => s + Number(r.balance || 0), 0);
  const tds = rows.reduce((s: number, r: any) => s + Number(r.tds_amount || 0), 0);

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Expenses & Bills"
        subtitle="Snap receipts, upload bills for AI extraction, or add manually."
        actions={
          <>
            <UploadButton kind="bill" label="Upload bills" />
            <Btn onClick={() => setOpen((s) => !s)}><Plus className="h-4 w-4" /> Add bill</Btn>
          </>
        }
      />
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={inr(totalSpend, { compact: true })} label="Total spend" />
        <Kpi value={inr(outstanding, { compact: true })} label="Unpaid" tone={outstanding > 0 ? "dn" : "up"} />
        <Kpi value={String(rows.length)} label="Bills" />
        <Kpi value={inr(tds, { compact: true })} label="TDS deducted" />
      </div>

      {open && (
        <Card title="New bill" className="mb-4">
          <div className="grid gap-3 md:grid-cols-3">
            <F label="Bill #" v={f.bill_number} on={(v) => setF({ ...f, bill_number: v })} />
            <F label="Vendor" v={f.vendor_name} on={(v) => setF({ ...f, vendor_name: v })} />
            <F label="Vendor GSTIN" v={f.vendor_gstin} on={(v) => setF({ ...f, vendor_gstin: v })} />
            <F label="Bill date" v={f.bill_date} on={(v) => setF({ ...f, bill_date: v })} type="date" />
            <F label="Due date" v={f.due_date} on={(v) => setF({ ...f, due_date: v })} type="date" />
            <F label="Subtotal (₹)" v={String(f.subtotal)} on={(v) => setF({ ...f, subtotal: Number(v) || 0 })} type="number" />
            <F label="GST %" v={String(f.gst_rate)} on={(v) => setF({ ...f, gst_rate: Number(v) || 0 })} type="number" />
            <F label="TDS (₹)" v={String(f.tds_amount)} on={(v) => setF({ ...f, tds_amount: Number(v) || 0 })} type="number" />
            <F label="Category" v={f.category} on={(v) => setF({ ...f, category: v })} />
          </div>
          {mut.error && <div className="mt-2 text-[12px] text-destructive">{(mut.error as Error).message}</div>}
          <div className="mt-3 flex justify-end gap-2">
            <Btn variant="o" onClick={() => setOpen(false)}>Cancel</Btn>
            <Btn onClick={() => mut.mutate()}>{mut.isPending ? "Saving…" : "Save bill"}</Btn>
          </div>
        </Card>
      )}

      <Card>
        {rows.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-5 w-5" />}
            title="No bills yet"
            description="Upload vendor bills and receipts — AI extracts amount, GST, TDS, due date — or add manually."
            primary={{ label: "Add bill", onClick: () => setOpen(true) }}
            secondary={{ label: "Upload receipts", onClick: () => {} }}
          />
        ) : (
          <table className="w-full text-[13px]">
            <thead className="text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
              <tr className="border-b border-border">
                <th className="pb-2">Bill</th><th className="pb-2">Vendor</th><th className="pb-2">Date</th>
                <th className="pb-2">Category</th><th className="pb-2">Amount</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="py-3 font-mono text-[11px] text-ink-4">{r.bill_number || "—"}</td>
                  <td className="font-medium text-ink">{r.vendor_name}</td>
                  <td className="text-ink-3">{dateShort(r.bill_date)}</td>
                  <td className="text-ink-3">{r.category || "—"}</td>
                  <td className="font-mono text-ink-2">{inr(Number(r.total))}</td>
                  <td><Pill tone={r.status === "paid" ? "done" : r.status === "overdue" ? "miss" : "pend"}>{r.status}</Pill></td>
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
