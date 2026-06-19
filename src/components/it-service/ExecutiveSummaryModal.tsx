import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pill } from "@/components/ui-kit";
import type { ExecutiveSummaryData } from "@/lib/it-service/executive-summary";

export function ExecutiveSummaryModal({
  open,
  onOpenChange,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ExecutiveSummaryData;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-border bg-background p-0">
        <DialogHeader className="border-b border-border bg-gradient-to-r from-surface-1 to-sky-50/40 px-6 py-4">
          <DialogTitle className="text-[18px] font-extrabold tracking-tight text-ink">
            Executive Summary
          </DialogTitle>
          <p className="text-[12px] text-ink-3">CEO compliance dashboard · Private Limited</p>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          <section>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-4">
              Overall Score
            </div>
            <div className="mt-1 text-[36px] font-extrabold tabular-nums text-primary">
              {summary.overallScore}%
            </div>
          </section>

          <section className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                Overdue
              </span>
              <Pill tone="miss">{summary.overdue.length}</Pill>
            </div>
            <ul className="space-y-1.5">
              {summary.overdue.length === 0 ? (
                <li className="text-[13px] text-ink-3">None</li>
              ) : (
                summary.overdue.map((name) => (
                  <li key={name} className="text-[13px] font-medium text-ink">
                    {name}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Upcoming
              </span>
              <Pill tone="pend">{summary.upcoming.length}</Pill>
            </div>
            <ul className="space-y-1.5">
              {summary.upcoming.length === 0 ? (
                <li className="text-[13px] text-ink-3">None</li>
              ) : (
                summary.upcoming.map((name) => (
                  <li key={name} className="text-[13px] font-medium text-ink">
                    {name}
                  </li>
                ))
              )}
            </ul>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-surface-2/50 p-4 text-center">
              <div className="text-[11px] font-bold uppercase text-ink-4">Critical Items</div>
              <div className="mt-1 text-[28px] font-extrabold text-destructive">
                {summary.criticalItems}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface-2/50 p-4 text-center">
              <div className="text-[11px] font-bold uppercase text-ink-4">Pending Items</div>
              <div className="mt-1 text-[28px] font-extrabold text-ink">{summary.pendingItems}</div>
            </div>
          </div>

          <section className="rounded-xl border border-border p-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-4">
              Recent Activity
            </div>
            <ul className="space-y-2">
              {summary.recentActivity.length === 0 ? (
                <li className="text-[13px] text-ink-3">No recent activity</li>
              ) : (
                summary.recentActivity.map((title) => (
                  <li key={title} className="flex items-center gap-2 text-[13px] text-ink">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {title}
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
