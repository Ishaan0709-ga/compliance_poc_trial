import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { inr } from "@/lib/format";

export type RevenueChartPoint = {
  month: string;
  mrr: number;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-lg shadow-slate-200/60">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-0.5 text-[15px] font-bold tracking-[-0.02em] text-slate-800 tabular-nums">
        {inr(payload[0].value)}
      </div>
      <div className="text-[10px] font-medium text-emerald-600">MRR</div>
    </div>
  );
}

export function FounderRevenueChart({ data }: { data: RevenueChartPoint[] }) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-slate-50/80 to-white p-3 ring-1 ring-slate-100">
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data} margin={{ top: 16, right: 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="founderLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="55%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
            <linearGradient id="founderAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.22} />
              <stop offset="45%" stopColor="#22c55e" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#84cc16" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 6"
            stroke="#e2e8f0"
            vertical={false}
            horizontalPoints={undefined}
          />

          <XAxis
            dataKey="month"
            axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 11, fontWeight: 600, fill: "#94a3b8" }}
            dy={8}
          />

          <YAxis
            axisLine={{ stroke: "#e2e8f0", strokeWidth: 1 }}
            tickLine={false}
            tick={{ fontSize: 11, fontWeight: 500, fill: "#94a3b8" }}
            width={52}
            tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`}
          />

          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }} />

          <Area
            type="monotone"
            dataKey="mrr"
            stroke="none"
            fill="url(#founderAreaGrad)"
            isAnimationActive
            animationDuration={800}
          />

          <Line
            type="monotone"
            dataKey="mrr"
            stroke="url(#founderLineGrad)"
            strokeWidth={2.5}
            dot={{
              r: 5,
              fill: "#ffffff",
              stroke: "#14b8a6",
              strokeWidth: 2.5,
            }}
            activeDot={{
              r: 7,
              fill: "#ffffff",
              stroke: "#22c55e",
              strokeWidth: 3,
            }}
            isAnimationActive
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
