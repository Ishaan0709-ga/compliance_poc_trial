import type { ReactNode } from "react";
import { Pill } from "@/components/ui-kit";
import { domainBadge } from "@/lib/it-service/domain-labels";
import { formatDueChip } from "@/lib/it-service/demo-reminder";
import { chipClass } from "@/lib/it-service/calendar-ui";
import { getCompliance } from "@/lib/it-service/master-data";
import type { CalendarItem } from "@/lib/it-service/types";

export function ComplianceCalendarRow({
  item,
  onDetails,
  expanded,
  children,
}: {
  item: CalendarItem;
  onDetails: () => void;
  expanded?: boolean;
  children?: ReactNode;
}) {
  const comp = getCompliance(item.complianceId);
  if (!comp) return null;

  const { day, month } = formatDueChip(item.dueDate);
  const statusTone =
    item.status === "completed" ? "done" : item.status === "overdue" ? "miss" : "pend";
  const statusLabel =
    item.status === "completed"
      ? "COMPLETED"
      : item.status === "overdue"
        ? "OVERDUE"
        : "PENDING";
  const barColor =
    item.status === "overdue"
      ? "bg-rose-500"
      : item.status === "completed"
        ? "bg-emerald-500"
        : "bg-sky-500";

  return (
    <div className="py-3">
      <div className="flex items-center gap-4">
        <div className="w-14 shrink-0 overflow-hidden rounded-xl border border-border bg-white text-center shadow-sm">
          <div className={`h-1 ${barColor}`} />
          <div className="py-1">
            <div className="text-[20px] font-extrabold leading-none text-ink">{day}</div>
            <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-ink-4">
              {month}
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${chipClass(item, comp.frequency)}`}
            >
              {domainBadge(comp.domainId)}
            </span>
            <span className="text-[14px] font-bold text-ink">{comp.name}</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[12px] text-ink-3">Owner: {item.owner}</span>
            <Pill tone={comp.riskLevel === "Critical" ? "miss" : comp.riskLevel === "High" ? "pend" : "n"}>
              {comp.riskLevel}
            </Pill>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <Pill tone={statusTone}>{statusLabel}</Pill>
          <button
            type="button"
            onClick={onDetails}
            className="mt-1.5 block text-[11px] font-bold text-primary hover:underline"
          >
            {expanded ? "Close" : "Details →"}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
