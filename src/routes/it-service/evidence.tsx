import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useITService } from "@/lib/it-service/context";
import { ITServiceShell } from "@/components/it-service/ITServiceShell";
import { RequireOnboarding } from "@/components/it-service/RequireOnboarding";
import { PageHeader, Card, Pill, Btn } from "@/components/ui-kit";
import { getCompliance } from "@/lib/it-service/master-data";
import { validateUploadedEvidence } from "@/lib/it-service/validation-engine";
import { findFocalCalendarItem } from "@/lib/it-service/compliance-utils";
import { Upload } from "lucide-react";

export const Route = createFileRoute("/it-service/evidence")({
  component: EvidencePage,
});

function EvidencePage() {
  return (
    <RequireOnboarding>
      <EvidenceContent />
    </RequireOnboarding>
  );
}

function EvidenceContent() {
  const { state, uploadEvidence } = useITService();
  const [selectedCompliance, setSelectedCompliance] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const applicable = state.applicable
    .filter((a) => a.applicable)
    .map((a) => getCompliance(a.complianceId))
    .filter(Boolean);

  const focal = selectedCompliance
    ? findFocalCalendarItem(state.calendar, selectedCompliance)
    : undefined;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCompliance || !state.profile) return;
    const { valid, status } = validateUploadedEvidence(file.name, file.type);
    if (!valid) {
      alert("Unsupported file type. Use PDF, DOCX, XLSX, PNG or JPEG.");
      return;
    }
    uploadEvidence({
      companyId: state.profile.companyId,
      complianceId: selectedCompliance,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      validationStatus: status,
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <ITServiceShell>
      <PageHeader
        title="Evidence repository"
        subtitle="Upload evidence linked to compliances — scores and calendar status update automatically."
      />

      <Card className="mb-4" title="Upload evidence">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-[12px] font-medium text-ink-3">Compliance</label>
            <select
              value={selectedCompliance}
              onChange={(e) => setSelectedCompliance(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-[13px]"
            >
              <option value="">Select compliance…</option>
              {applicable.map((c) => (
                <option key={c!.id} value={c!.id}>{c!.name}</option>
              ))}
            </select>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
            className="hidden"
            onChange={handleUpload}
          />
          <Btn
            disabled={!selectedCompliance}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" /> Choose file
          </Btn>
        </div>
        <p className="mt-2 text-[11px] text-ink-4">
          Supported: PDF, DOCX, XLSX, PNG, JPEG
          {focal && (
            <span className="mt-1 block text-ink-3">
              Applies to current period: <strong>{focal.period}</strong> (due {focal.dueDate})
            </span>
          )}
        </p>
      </Card>

      <Card title="Uploaded evidence">
        <div className="divide-y divide-border">
          {state.evidence.length === 0 ? (
            <p className="py-4 text-[13px] text-ink-3">No evidence uploaded yet.</p>
          ) : (
            state.evidence.map((ev) => {
              const comp = getCompliance(ev.complianceId);
              return (
                <div key={ev.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-[13px] font-bold">{ev.filename}</div>
                    <div className="text-[12px] text-ink-3">
                      {comp?.name} · {new Date(ev.uploadedAt).toLocaleString("en-IN")}
                    </div>
                  </div>
                  <Pill tone={ev.validationStatus === "approved" ? "done" : ev.validationStatus === "rejected" ? "miss" : "pend"}>
                    {ev.source === "attestation" ? "self-attested" : ev.validationStatus}
                  </Pill>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </ITServiceShell>
  );
}
