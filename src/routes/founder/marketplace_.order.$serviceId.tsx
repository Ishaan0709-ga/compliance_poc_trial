import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  User,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Btn, Card, Pill } from "@/components/ui-kit";
import { getServiceById, tagPillTone } from "@/lib/marketplace/catalog";
import { placeOrder } from "@/lib/marketplace/storage";
import { getCompanyProfile } from "@/lib/profile.functions";

export const Route = createFileRoute("/founder/marketplace_/order/$serviceId")({
  head: ({ params }) => ({
    meta: [{ title: `Order — ${params.serviceId} — ComplyOS` }],
  }),
  component: OrderCheckoutPage,
});

function OrderCheckoutPage() {
  const { serviceId } = Route.useParams();
  const navigate = useNavigate();
  const service = getServiceById(serviceId);

  const profFn = useServerFn(getCompanyProfile);
  const profile = useQuery({ queryKey: ["company-profile"], queryFn: () => profFn() });

  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [periodLabel, setPeriodLabel] = useState("");
  const [employeeCount, setEmployeeCount] = useState("10");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    const p = profile.data?.profile;
    if (!p || prefilled) return;
    if (p.legal_name) setCompanyName(p.legal_name);
    setPrefilled(true);
  }, [profile.data, prefilled]);

  if (!service) {
    return (
      <PortalShell portalId="founder">
        <div className="py-16 text-center">
          <h1 className="text-[20px] font-bold text-ink">Service not found</h1>
          <Link to="/founder/marketplace" className="mt-4 inline-block text-primary hover:underline">
            ← Back to marketplace
          </Link>
        </div>
      </PortalShell>
    );
  }

  const needsPeriod = service.category === "GST & Tax" && service.id !== "gstr-9";
  const needsEmployees = service.billingType === "per_employee";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!companyName.trim() || !contactName.trim() || !contactEmail.trim() || !contactPhone.trim()) {
      setErr("Please fill in all required contact fields.");
      return;
    }
    if (!agreed) {
      setErr("Please confirm the service terms to place your order.");
      return;
    }

    setBusy(true);
    try {
      const order = placeOrder({
        serviceId: service.id,
        companyName,
        contactName,
        contactEmail,
        contactPhone,
        periodLabel: needsPeriod ? periodLabel : undefined,
        employeeCount: needsEmployees ? Number(employeeCount) || 1 : undefined,
        notes,
      });

      if (!order) {
        setErr("Could not place order. Try again.");
        return;
      }

      navigate({
        to: "/founder/orders/$orderId",
        params: { orderId: order.id },
        search: { placed: "1" },
      });
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none transition-shadow placeholder:text-ink-4 focus:border-primary focus:ring-2 focus:ring-primary-muted";

  return (
    <PortalShell portalId="founder">
      <Link
        to="/founder/marketplace"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-4 hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to marketplace
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="mb-6">
            <Pill tone="n">{service.category}</Pill>
            <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-ink">
              {service.name}
            </h1>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-ink-3">
              {service.description}
            </p>
          </div>

          <Card title="Order details" className="!p-5">
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Company name *
                  </label>
                  <input
                    className={inputClass}
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Grae Intelligence Technologies Pvt. Ltd."
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Contact person *
                  </label>
                  <input
                    className={inputClass}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Work email *
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@company.in"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Mobile *
                  </label>
                  <input
                    type="tel"
                    className={inputClass}
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              {needsPeriod && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Filing period *
                  </label>
                  <input
                    className={inputClass}
                    value={periodLabel}
                    onChange={(e) => setPeriodLabel(e.target.value)}
                    placeholder="e.g. Apr 2026"
                    required
                  />
                </div>
              )}

              {needsEmployees && (
                <div>
                  <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                    Number of employees *
                  </label>
                  <input
                    type="number"
                    min={1}
                    className={inputClass}
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-ink-2">
                  Notes for your partner (optional)
                </label>
                <textarea
                  className={`${inputClass} min-h-[88px] resize-y`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any context — urgency, prior filing history, special instructions…"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface-2/50 p-3.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-[12px] leading-relaxed text-ink-3">
                  I agree to ComplyOS marketplace terms — fixed price, vetted partner assignment,
                  and document submission within 3 business days to meet the stated turnaround.
                </span>
              </label>

              {err && (
                <div className="rounded-xl border border-destructive-border bg-destructive-muted px-3.5 py-2.5 text-[12px] font-medium text-destructive">
                  {err}
                </div>
              )}

              <Btn type="submit" disabled={busy} className="w-full justify-center !py-3">
                Confirm order · {service.priceDisplay}
                <ArrowRight className="h-4 w-4" />
              </Btn>
            </form>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card className="!p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                  Summary
                </div>
                <div className="mt-1 text-[22px] font-extrabold tracking-[-0.02em] text-ink">
                  {service.priceDisplay}
                </div>
              </div>
              {service.tag && (
                <Pill tone={tagPillTone(service.tag)}>{service.tag.label}</Pill>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 text-[13px] text-ink-3">
              <Clock className="h-4 w-4 shrink-0 text-ink-4" />
              Turnaround · {service.tat}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[13px] text-ink-3">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              Vetted CA / CS / Legal partner
            </div>
          </Card>

          <Card title="What's included" className="!p-5">
            <ul className="space-y-2">
              {service.includes.map((item) => (
                <li key={item} className="flex gap-2 text-[13px] text-ink-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card title="Documents you'll need" className="!p-5">
            <ul className="space-y-2">
              {service.documentsNeeded.map((doc) => (
                <li key={doc} className="flex gap-2 text-[13px] text-ink-3">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {doc}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-ink-4">
              Upload via Document Vault after placing the order. Your partner will be notified
              automatically.
            </p>
          </Card>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-[12px] text-ink-3">
            <User className="h-4 w-4 text-ink-4" />
            Partner assigned within minutes of confirmation
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
