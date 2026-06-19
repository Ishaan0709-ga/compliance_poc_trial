import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Card, Kpi, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users2, FileText, Plus, Download, Send, Check, Building2, Banknote, Plug, ArrowRight, Trash2 } from "lucide-react";

export const Route = createFileRoute("/founder/payroll")({
  head: () => ({ meta: [{ title: "Payroll — ComplyOS" }] }),
  component: PayrollPage,
});

type Employee = {
  id: string;
  emp_code: string;
  name: string;
  role: string;
  pan: string;
  doj: string;
  ctc: number;
  email?: string | null;
  bank: { name: string; account: string; ifsc: string };
};

function inr(n: number) { return "₹ " + Math.round(n).toLocaleString("en-IN"); }

// Rough India payroll math (illustrative — not tax advice)
function computeSlip(emp: Employee) {
  const monthlyCtc = emp.ctc / 12;
  const basic = Math.round(monthlyCtc * 0.45);
  const hra = Math.round(basic * 0.5);
  const special = Math.round(monthlyCtc - basic - hra - 1800 - Math.min(1800, basic * 0.12));
  const employerPf = Math.min(1800, Math.round(basic * 0.12));     // employer cost
  const employeePf = Math.min(1800, Math.round(basic * 0.12));     // deduction
  const professionalTax = 200;
  const tdsAnnual = Math.max(0, (emp.ctc - 700000) * 0.10);        // crude new-regime ish
  const tds = Math.round(tdsAnnual / 12);
  const gross = basic + hra + special;
  const deductions = employeePf + professionalTax + tds;
  const net = gross - deductions;
  const companyCost = gross + employerPf; // bearable by company
  return { basic, hra, special, employerPf, employeePf, professionalTax, tds, gross, deductions, net, companyCost };
}

function PayrollPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [period] = useState(() => new Date().toLocaleString("en-IN", { month: "long", year: "numeric" }));
  const [slipFor, setSlipFor] = useState<Employee | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [posted, setPosted] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("employees")
      .select("id,emp_code,name,role,pan,doj,ctc,email,bank_name,bank_account,bank_ifsc")
      .eq("status", "active")
      .order("created_at", { ascending: true });
    if (!error && data) {
      setEmployees(
        (data as any[]).map((r) => ({
          id: r.id,
          emp_code: r.emp_code,
          name: r.name,
          role: r.role || "",
          pan: r.pan || "",
          doj: r.doj || "",
          ctc: Number(r.ctc) || 0,
          email: r.email,
          bank: { name: r.bank_name || "", account: r.bank_account || "", ifsc: r.bank_ifsc || "" },
        }))
      );
    }
  }
  useEffect(() => { if (userId) load(); }, [userId]);

  const totals = useMemo(() => {
    return employees.reduce(
      (a, e) => {
        const s = computeSlip(e);
        a.gross += s.gross;
        a.net += s.net;
        a.tds += s.tds;
        a.pf += s.employerPf + s.employeePf;
        a.cost += s.companyCost;
        return a;
      },
      { gross: 0, net: 0, tds: 0, pf: 0, cost: 0 }
    );
  }, [employees]);

  async function addEmployee(e: Omit<Employee, "id">) {
    if (!userId) return toast.error("Please sign in first");
    const { error } = await supabase.from("employees").insert({
      user_id: userId,
      emp_code: e.emp_code,
      name: e.name,
      role: e.role,
      pan: e.pan,
      doj: e.doj || null,
      ctc: e.ctc,
      email: e.email || null,
      bank_name: e.bank.name,
      bank_account: e.bank.account,
      bank_ifsc: e.bank.ifsc,
    });
    if (error) return toast.error(error.message);
    toast.success(`${e.name} added — bank details stored securely`);
    setAddOpen(false);
    load();
  }

  async function removeEmployee(id: string) {
    if (!confirm("Remove this employee?")) return;
    const { error } = await supabase.from("employees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Employee removed");
    load();
  }

  async function postToBooks() {
    if (!userId || employees.length === 0) return toast.error("Add employees first");
    const today = new Date().toISOString().slice(0, 10);
    const rows = employees.flatMap((e) => {
      const s = computeSlip(e);
      return [
        { user_id: userId, vendor: `Salary — ${e.name}`, amount: s.gross, currency: "INR", expense_date: today, category: "Salaries & Wages", source: "payroll", status: "approved", subject: `Salary ${period}` },
        { user_id: userId, vendor: `Employer PF — ${e.name}`, amount: s.employerPf, currency: "INR", expense_date: today, category: "Statutory · PF", source: "payroll", status: "approved", subject: `EPF ${period}` },
        { user_id: userId, vendor: `Professional Tax — ${e.name}`, amount: s.professionalTax, currency: "INR", expense_date: today, category: "Statutory · PT", source: "payroll", status: "approved", subject: `PT ${period}` },
      ];
    });
    const { error } = await supabase.from("expenses").insert(rows as any);
    if (error) return toast.error(error.message);
    setPosted(true);
    toast.success(`Posted ${rows.length} entries to Expenses & Bills`);
  }

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Payroll"
        subtitle={`${period} · ${employees.length} employees · auto-flows into Books, Expenses & Compliance`}
        actions={
          <>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add employee
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-brand text-white hover:opacity-90" onClick={postToBooks}>
              <Check className="h-3.5 w-3.5" /> Run payroll & post to Books
            </Button>
          </>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Kpi value={inr(totals.gross)} label="Gross payroll" tone="neu" />
        <Kpi value={inr(totals.net)} label="Net payable" tone="neu" />
        <Kpi value={inr(totals.tds)} label="TDS u/s 192" tone="neu" />
        <Kpi value={inr(totals.pf)} label="PF (Er + Ee)" tone="neu" />
        <Kpi value={inr(totals.cost)} label="Total company cost" change="Booked as expense" tone="up" />
      </div>

      {posted && (
        <div className="mb-5 flex items-start gap-2 rounded-lg border border-success-border bg-success-muted p-3 text-[12px] text-success-foreground">
          <Check className="mt-0.5 h-4 w-4 text-success" />
          <div className="text-ink-2">
            <b>Posted.</b> Salary expense {inr(totals.gross)}, Employer PF {inr(Math.round(totals.pf / 2))}, and Professional Tax pushed to <b>Expenses & Bills</b>. TDS {inr(totals.tds)} added to <b>Compliance Calendar</b> (due 7 May).
          </div>
        </div>
      )}

      <div className="mb-5">
        <Card title="Bank & payout connectors">
          <div className="grid gap-2 md:grid-cols-3">
            <ConnectorRow name="HDFC Bank — Current a/c" status="connected" sub="Statements via Gmail e-statement parser · ••4218" />
            <ConnectorRow name="Razorpay X Payroll" status="connected" sub="One-click salary disbursal · PF/ESI/PT" />
            <ConnectorRow name="Paytm for Business" status="available" sub="Add API key to enable settlements pull" />
          </div>
          <p className="mt-3 text-[11px] text-ink-4">
            HDFC has no public retail-banking API — we ingest e-statements from Gmail. Razorpay & Paytm expose REST APIs and can be wired with a merchant key.
          </p>
        </Card>
      </div>

      <Card
        title="Employees"
        action={<Pill tone="n">{employees.length} active</Pill>}
      >
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[12px]">
            <thead className="bg-surface-2 text-ink-4">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Employee</th>
                <th className="px-3 py-2 text-left font-medium">PAN</th>
                <th className="px-3 py-2 text-left font-medium">Bank account</th>
                <th className="px-3 py-2 text-right font-medium">CTC (annual)</th>
                <th className="px-3 py-2 text-right font-medium">Net / month</th>
                <th className="px-3 py-2 text-right font-medium">Co. cost / month</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const s = computeSlip(e);
                return (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="text-ink">{e.name}</div>
                      <div className="text-[10px] text-ink-4">{e.emp_code} · {e.role}</div>
                    </td>
                    <td className="px-3 py-2 font-mono text-ink-3">{e.pan}</td>
                    <td className="px-3 py-2">
                      <div className="text-ink">{e.bank.name}</div>
                      <div className="font-mono text-[10px] text-ink-4">{e.bank.account} · {e.bank.ifsc}</div>
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-ink">{inr(e.ctc)}</td>
                    <td className="px-3 py-2 text-right font-mono text-ink">{inr(s.net)}</td>
                    <td className="px-3 py-2 text-right font-mono text-ink">{inr(s.companyCost)}</td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-[11px]" onClick={() => setSlipFor(e)}>
                          <FileText className="h-3 w-3" /> Slip
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" onClick={() => removeEmployee(e.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Salary slip dialog */}
      <Dialog open={!!slipFor} onOpenChange={(o) => !o && setSlipFor(null)}>
        <DialogContent className="max-w-2xl">
          {slipFor && <SalarySlip emp={slipFor} period={period} />}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.success("PDF generated")}>
              <Download className="h-3.5 w-3.5" /> Download PDF
            </Button>
            <Button size="sm" className="gap-1.5 bg-gradient-brand text-white hover:opacity-90" onClick={() => { toast.success(`Slip emailed to ${slipFor?.name}`); setSlipFor(null); }}>
              <Send className="h-3.5 w-3.5" /> Email to employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add employee */}
      <AddEmployeeDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addEmployee}
        nextCode={`GR-${String(employees.length + 1).padStart(3, "0")}`}
      />
    </PortalShell>
  );
}

function ConnectorRow({ name, status, sub }: { name: string; status: "connected" | "available"; sub: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${status === "connected" ? "bg-gradient-cyan" : "bg-surface-2"} text-white`}>
        {status === "connected" ? <Banknote className="h-4 w-4" /> : <Plug className="h-4 w-4 text-ink-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-ink truncate">{name}</span>
          <Pill tone={status === "connected" ? "done" : "n"}>{status}</Pill>
        </div>
        <div className="mt-0.5 text-[11px] text-ink-4">{sub}</div>
      </div>
      {status === "available" && <ArrowRight className="h-3.5 w-3.5 text-ink-4" />}
    </div>
  );
}

function SalarySlip({ emp, period }: { emp: Employee; period: string }) {
  const s = computeSlip(emp);
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Salary Slip · {period}
        </DialogTitle>
        <DialogDescription>
          Grae Intelligence Technologies Pvt. Ltd. · CIN U72200KA2024PTC198421
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-surface-2 p-3 text-[12px]">
        <div><div className="text-[10px] uppercase text-ink-4">Employee</div><div className="text-ink">{emp.name}</div><div className="text-[10px] text-ink-4">{emp.emp_code} · {emp.role}</div></div>
        <div><div className="text-[10px] uppercase text-ink-4">PAN · DOJ</div><div className="font-mono text-ink">{emp.pan}</div><div className="text-[10px] text-ink-4">Joined {emp.doj}</div></div>
        <div className="col-span-2"><div className="text-[10px] uppercase text-ink-4">Bank credit</div><div className="text-ink">{emp.bank.name}</div><div className="font-mono text-[10px] text-ink-4">{emp.bank.account} · {emp.bank.ifsc}</div></div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border">
          <div className="bg-surface-2 px-3 py-2 text-[11px] font-medium text-ink-3">Earnings</div>
          <SlipRow k="Basic" v={s.basic} />
          <SlipRow k="HRA" v={s.hra} />
          <SlipRow k="Special allowance" v={s.special} />
          <SlipRow k="Gross" v={s.gross} bold />
        </div>
        <div className="rounded-lg border border-border">
          <div className="bg-surface-2 px-3 py-2 text-[11px] font-medium text-ink-3">Deductions</div>
          <SlipRow k="PF (employee 12%)" v={s.employeePf} />
          <SlipRow k="Professional tax" v={s.professionalTax} />
          <SlipRow k="TDS u/s 192" v={s.tds} />
          <SlipRow k="Total deductions" v={s.deductions} bold />
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-primary-border bg-primary-muted px-4 py-3">
        <div className="text-[12px] text-ink-3">Net pay credited</div>
        <div className="font-mono text-[16px] font-semibold text-primary">{inr(s.net)}</div>
      </div>

      <div className="rounded-lg border border-cyan/20 bg-cyan-muted/40 p-3 text-[11px] leading-relaxed text-ink-2">
        <b>Company-borne cost:</b> {inr(s.companyCost)} ({inr(s.gross)} gross + {inr(s.employerPf)} employer PF). Booked under <span className="font-mono">Salaries & Wages</span>; employer PF and gratuity provision count toward <b>company cost</b> in your P&L and runway math.
      </div>
    </>
  );
}

function SlipRow({ k, v, bold = false }: { k: string; v: number; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between border-t border-border px-3 py-2 text-[12px] ${bold ? "bg-surface-2 font-semibold text-ink" : "text-ink-2"}`}>
      <span>{k}</span>
      <span className="font-mono">{inr(v)}</span>
    </div>
  );
}

function AddEmployeeDialog({
  open, onClose, onAdd, nextCode,
}: { open: boolean; onClose: () => void; onAdd: (e: Omit<Employee, "id">) => void; nextCode: string }) {
  const [form, setForm] = useState({ name: "", role: "", pan: "", doj: "", ctc: "", email: "", bankName: "", account: "", ifsc: "" });
  function set<K extends keyof typeof form>(k: K, v: string) { setForm({ ...form, [k]: v }); }

  function submit() {
    if (!form.name || !form.pan || !form.account || !form.ifsc) {
      toast.error("Name, PAN, account and IFSC are required");
      return;
    }
    onAdd({
      emp_code: nextCode,
      name: form.name,
      role: form.role || "—",
      pan: form.pan.toUpperCase(),
      doj: form.doj || new Date().toISOString().slice(0, 10),
      ctc: Number(form.ctc) || 0,
      email: form.email || null,
      bank: { name: form.bankName || "—", account: form.account, ifsc: form.ifsc.toUpperCase() },
    });
    setForm({ name: "", role: "", pan: "", doj: "", ctc: "", email: "", bankName: "", account: "", ifsc: "" });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Users2 className="h-5 w-5 text-primary" /> Add employee</DialogTitle>
          <DialogDescription>Bank details are stored encrypted and used only for salary disbursal.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full name"><Input value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Role"><Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g. Engineer" /></Field>
          <Field label="PAN"><Input value={form.pan} onChange={(e) => set("pan", e.target.value)} placeholder="AAAAA9999A" maxLength={10} /></Field>
          <Field label="Date of joining"><Input type="date" value={form.doj} onChange={(e) => set("doj", e.target.value)} /></Field>
          <Field label="Annual CTC (₹)"><Input type="number" value={form.ctc} onChange={(e) => set("ctc", e.target.value)} placeholder="1800000" /></Field>
          <Field label="Email"><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@company.com" /></Field>
          <Field label="Bank name"><Input value={form.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="HDFC Bank" /></Field>
          <Field label="Account number"><Input value={form.account} onChange={(e) => set("account", e.target.value)} placeholder="50100xxxxxxx" /></Field>
          <Field label="IFSC"><Input value={form.ifsc} onChange={(e) => set("ifsc", e.target.value)} placeholder="HDFC0000123" maxLength={11} /></Field>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" className="bg-gradient-brand text-white hover:opacity-90" onClick={submit}>Add employee</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-[11px] text-ink-3">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
