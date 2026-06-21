import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Card, Pill, Btn, PageHeader, Kpi } from "@/components/ui-kit";
import { MessageSquare, FileText, ShoppingBag, ArrowRight } from "lucide-react";
import { getOrderStats, loadOrders } from "@/lib/marketplace/storage";
import { isActiveOrder, needsFounderAction, orderStatusTone } from "@/lib/marketplace/types";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/founder/orders/")({
  head: () => ({ meta: [{ title: "My Orders — ComplyOS" }] }),
  component: Orders,
});

type FilterTab = "all" | "active" | "completed";

function Orders() {
  const [orders, setOrders] = useState(loadOrders);
  const [tab, setTab] = useState<FilterTab>("all");

  useEffect(() => {
    const refresh = () => setOrders(loadOrders());
    window.addEventListener("founder-orders-update", refresh);
    return () => window.removeEventListener("founder-orders-update", refresh);
  }, []);

  const stats = useMemo(() => getOrderStats(orders), [orders]);

  const filtered = useMemo(() => {
    if (tab === "active") return orders.filter((o) => isActiveOrder(o.status));
    if (tab === "completed")
      return orders.filter((o) => o.status === "completed" || o.status === "filed");
    return orders;
  }, [orders, tab]);

  const spentLabel = inr(stats.spentYtd, { compact: true });

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="My Orders"
        subtitle="Track every active and historical order — live from your marketplace purchases."
        actions={
          <Link to="/founder/marketplace">
            <Btn variant="o">
              <ShoppingBag className="h-3.5 w-3.5" /> Browse services
            </Btn>
          </Link>
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi value={String(stats.inProgress)} label="In progress" />
        <Kpi
          value={String(stats.awaitingInput)}
          label="Awaiting your input"
          tone={stats.awaitingInput > 0 ? "dn" : "neu"}
          change={stats.awaitingInput > 0 ? "action needed" : undefined}
        />
        <Kpi value={String(stats.completedYtd)} label="Completed (YTD)" tone="up" />
        <Kpi value={spentLabel} label="Spent (YTD)" />
      </div>

      <div className="mb-4 flex gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {(
          [
            { id: "all" as const, label: "All orders" },
            { id: "active" as const, label: "Active" },
            { id: "completed" as const, label: "Completed" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-[12px] font-bold transition-colors ${
              tab === t.id ? "bg-white text-primary shadow-sm" : "text-ink-4 hover:text-ink-2"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="!py-16 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-ink-4" />
          <h2 className="mt-3 text-[18px] font-bold text-ink">
            {orders.length === 0 ? "No orders yet" : "No orders in this view"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-[13px] text-ink-3">
            {orders.length === 0
              ? "Browse the marketplace and place your first order — GST, ROC, payroll, and more."
              : "Try a different filter to see other orders."}
          </p>
          {orders.length === 0 && (
            <Link to="/founder/marketplace" className="mt-5 inline-block">
              <Btn>
                Open marketplace <ArrowRight className="h-3.5 w-3.5" />
              </Btn>
            </Link>
          )}
        </Card>
      ) : (
        <Card className="!p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-[13px]">
              <thead className="bg-surface-2/80 text-left text-[10px] uppercase tracking-[0.1em] text-ink-4">
                <tr className="border-b border-border">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const due = o.dueDate
                    ? new Date(o.dueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })
                    : "—";
                  return (
                    <tr
                      key={o.id}
                      className="border-b border-border/70 last:border-0 hover:bg-surface-2/30"
                    >
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-[11px] font-bold text-ink-4">{o.id}</div>
                        <div className="text-[12px] font-semibold text-ink">{o.priceDisplay}</div>
                        {o.periodLabel && (
                          <div className="text-[11px] text-ink-4">{o.periodLabel}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-ink">{o.serviceName}</div>
                        <div className="text-[11px] text-ink-4">{o.partner}</div>
                        {needsFounderAction(o.status) && (
                          <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wide text-amber-600">
                            Upload docs
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Pill tone={orderStatusTone(o.status)}>{o.stage}</Pill>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-2">
                            <div
                              className={`h-full rounded-full ${
                                o.progress >= 100 ? "bg-success" : "bg-primary"
                              }`}
                              style={{ width: `${o.progress}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold tabular-nums text-ink-4">
                            {o.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12px] text-ink-3">{due}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Btn variant="g" title="Message partner">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Btn>
                          <Link to="/founder/orders/$orderId" params={{ orderId: o.id }}>
                            <Btn variant="o">
                              <FileText className="h-3.5 w-3.5" /> Open
                            </Btn>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </PortalShell>
  );
}
