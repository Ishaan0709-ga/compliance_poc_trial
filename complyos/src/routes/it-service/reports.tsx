import { createFileRoute } from "@tanstack/react-router";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Btn } from "@/components/ui-kit";
import { DOMAINS, getCompliance } from "@/lib/it-service/master-data";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/it-service/reports")({
  component: ReportsPage,
});

function downloadText(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportsPage() {
  return (
    <RequireOnboarding>
      <ReportsContent />
    </RequireOnboarding>
  );
}

function ReportsContent() {
  const { state } = useITService();
  const { profile, kpis, domainScores, calendar, risks } = state;

  const buildReport = (type: string) => {
    const lines = [
      `ComplyOS — ${type}`,
      `Company: ${profile?.companyName}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      `Overall Compliance Score: ${kpis.overallScore}%`,
      `Open Actions: ${kpis.openActions}`,
      `Overdue: ${kpis.overdueCount}`,
      `Critical Risks: ${kpis.criticalRisks}`,
      "",
      "Domain Scores:",
      ...domainScores.map((d) => {
        const dom = DOMAINS.find((x) => x.id === d.domainId);
        return `  ${dom?.name}: ${d.score}%`;
      }),
      "",
      "Upcoming Calendar:",
      ...calendar
        .filter((c) => c.status !== "completed")
        .slice(0, 20)
        .map((c) => {
          const comp = getCompliance(c.complianceId);
          return `  ${c.dueDate} — ${comp?.name} (${c.status})`;
        }),
      "",
      "Risk Alerts:",
      ...risks.map((r) => `  [${r.level}] ${r.title}`),
    ];
    return lines.join("\n");
  };

  const reports = [
    { id: "board", label: "Board Report", desc: "Executive summary for board review" },
    { id: "management", label: "Management Report", desc: "Operational compliance status" },
    { id: "audit", label: "Audit Report", desc: "Evidence and control status" },
    { id: "excel", label: "Excel Export", desc: "CSV format for spreadsheet analysis" },
  ];

  const handleDownload = (id: string, label: string) => {
    const ext = id === "excel" ? "csv" : "txt";
    const content =
      id === "excel"
        ? [
            "Compliance,Due Date,Status,Domain,Risk",
            ...calendar.map((c) => {
              const comp = getCompliance(c.complianceId);
              return `"${comp?.name}",${c.dueDate},${c.status},${comp?.domainId},${comp?.riskLevel}`;
            }),
          ].join("\n")
        : buildReport(label);
    downloadText(`${profile?.companyName || "complyos"}-${id}.${ext}`, content);
  };

  return (
    <ITServiceShell>
      <PageHeader
        title="Reports"
        subtitle="Generate compliance reports from live data — scores, calendar, risks and evidence status."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[14px] font-bold">
                  <FileText className="h-4 w-4 text-primary" />
                  {r.label}
                </div>
                <p className="mt-1 text-[12px] text-ink-3">{r.desc}</p>
              </div>
              <Btn variant="o" onClick={() => handleDownload(r.id, r.label)}>
                <Download className="h-3.5 w-3.5" /> Download
              </Btn>
            </div>
          </Card>
        ))}
      </div>
    </ITServiceShell>
  );
}
