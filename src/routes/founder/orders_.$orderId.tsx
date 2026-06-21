import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  Upload,
  User,
} from "lucide-react";
import { PortalShell } from "@/components/PortalShell";
import { Btn, Card, Pill } from "@/components/ui-kit";
import { getServiceById } from "@/lib/marketplace/catalog";
import { getOrderById } from "@/lib/marketplace/storage";
import { orderStatusTone } from "@/lib/marketplace/types";
import { inr } from "@/lib/format";

type OrderSearch = { placed?: string };

export const Route = createFileRoute("/founder/orders_/$orderId")({
  head: ({ params }) => ({
    meta: [{ title: `Order ${params.orderId} — ComplyOS` }],
  }),
  validateSearch: (search: Record<string, unknown>): OrderSearch => ({
    placed: typeof search.placed === "string" ? search.placed : undefined,
  }),
  component: OrderDetailPage,
});

function OrderDetailPage() {
  const { orderId } = Route.useParams();
  const { placed } = Route.useSearch();
  const [order, setOrder] = useState(() => getOrderById(orderId));
  const [showSuccess, setShowSuccess] = useState(placed === "1");

  useEffect(() => {
    const refresh = () => setOrder(getOrderById(orderId));
    window.addEventListener("founder-orders-update", refresh);
    return () => window.removeEventListener("founder-orders-update", refresh);
  }, [orderId]);

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => setShowSuccess(false), 8000);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  if (!order) {
    return (
      <PortalShell portalId="founder">
        <div className="py-16 text-center">
          <h1 className="text-[20px] font-bold text-ink">Order not found</h1>
          <p className="mt-2 text-[13px] text-ink-3">Order {orderId} doesn't exist or was removed.</p>
          <Link to="/founder/orders" className="mt-4 inline-block text-primary hover:underline">
            ← My orders
          </Link>
        </div>
      </PortalShell>
    );
  }

  const service = getServiceById(order.serviceId);
  const dueLabel = order.dueDate
    ? new Date(order.dueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <PortalShell portalId="founder">
      <Link
        to="/founder/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-4 hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> My orders
      </Link>

      {showSuccess && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-success-border bg-success-muted px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
          <div>
            <div className="text-[14px] font-bold text-ink">Order placed successfully</div>
            <p className="mt-0.5 text-[13px] text-ink-3">
              {order.partner} has been assigned. Upload documents in Vault to start processing.
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[12px] font-bold text-ink-4">{order.id}</span>
            <Pill tone={orderStatusTone(order.status)}>{order.stage}</Pill>
            <Pill tone="n">{order.category}</Pill>
          </div>
          <h1 className="mt-2 text-[26px] font-extrabold tracking-[-0.03em] text-ink">
            {order.serviceName}
          </h1>
          {order.periodLabel && (
            <p className="mt-1 text-[13px] text-ink-3">Period · {order.periodLabel}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-[11px] font-bold uppercase tracking-wider text-ink-4">Order value</div>
          <div className="text-[22px] font-extrabold text-ink">{order.priceDisplay}</div>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: User, label: "Partner", value: order.partner },
          { icon: Clock, label: "Turnaround", value: order.tat },
          { icon: Calendar, label: "Due by", value: dueLabel },
          {
            icon: Calendar,
            label: "Placed",
            value: new Date(order.placedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-surface px-4 py-3 shadow-card"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ink-4">
              <Icon className="h-3.5 w-3.5" /> {label}
            </div>
            <div className="mt-1 text-[14px] font-semibold text-ink">{value}</div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[12px]">
          <span className="font-medium text-ink-3">Progress</span>
          <span className="font-bold tabular-nums text-ink">{order.progress}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={`h-full rounded-full transition-all ${
              order.progress >= 100 ? "bg-success" : "bg-primary"
            }`}
            style={{ width: `${order.progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card title="Activity timeline" className="!p-4">
          <div className="space-y-0">
            {order.timeline.map((ev, i) => (
              <div key={`${ev.at}-${i}`} className="relative flex gap-3 pb-5 last:pb-0">
                {i < order.timeline.length - 1 && (
                  <span className="absolute left-[7px] top-4 h-[calc(100%-8px)] w-px bg-border" />
                )}
                <span
                  className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                    i === 0 ? "border-primary bg-primary" : "border-border bg-surface"
                  }`}
                />
                <div>
                  <div className="text-[13px] font-semibold text-ink">{ev.label}</div>
                  {ev.detail && (
                    <div className="mt-0.5 text-[12px] text-ink-3">{ev.detail}</div>
                  )}
                  <div className="mt-0.5 text-[11px] text-ink-4">
                    {new Date(ev.at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card title="Contact & billing" className="!p-4">
            <dl className="space-y-2.5 text-[13px]">
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                  Company
                </dt>
                <dd className="font-medium text-ink">{order.companyName}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                  Contact
                </dt>
                <dd className="font-medium text-ink">{order.contactName}</dd>
              </div>
              <div className="flex items-center gap-2 text-ink-3">
                <Mail className="h-3.5 w-3.5" /> {order.contactEmail}
              </div>
              <div className="flex items-center gap-2 text-ink-3">
                <Phone className="h-3.5 w-3.5" /> {order.contactPhone}
              </div>
              <div className="border-t border-border pt-2">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                  Amount
                </dt>
                <dd className="font-bold text-ink">
                  {order.priceDisplay}{" "}
                  <span className="font-normal text-ink-4">({inr(order.priceAmount)})</span>
                </dd>
              </div>
              {order.notes && (
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
                    Your notes
                  </dt>
                  <dd className="text-ink-3">{order.notes}</dd>
                </div>
              )}
            </dl>
          </Card>

          {service && (
            <Card title="Required documents" className="!p-4">
              <ul className="space-y-2">
                {service.documentsNeeded.map((doc) => (
                  <li key={doc} className="flex gap-2 text-[13px] text-ink-3">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {doc}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex flex-wrap gap-2">
            <Link to="/founder/vault">
              <Btn variant="o">
                <Upload className="h-3.5 w-3.5" /> Upload documents
              </Btn>
            </Link>
            <Btn variant="g">
              <MessageSquare className="h-3.5 w-3.5" /> Message partner
            </Btn>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
