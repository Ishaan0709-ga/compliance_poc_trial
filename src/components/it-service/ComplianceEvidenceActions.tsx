import { useRef, useState } from "react";
import { CheckCircle2, Loader2, Upload, X } from "lucide-react";
import { Btn } from "@/components/ui-kit";
import { useITService } from "@/lib/it-service/context";
import { findFocalCalendarItem } from "@/lib/it-service/compliance-utils";
import { getCompliance } from "@/lib/it-service/master-data";
import { validateUploadedEvidence } from "@/lib/it-service/validation-engine";
import type { EvidenceRecord } from "@/lib/it-service/types";

export function getLatestEvidence(
  complianceId: string,
  evidence: EvidenceRecord[]
): EvidenceRecord | undefined {
  return evidence
    .filter((e) => e.complianceId === complianceId && e.validationStatus === "approved")
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
}

type PanelProps = {
  complianceId: string;
  calendarItemId?: string;
  onClose?: () => void;
  onComplete?: () => void;
};

export function ComplianceEvidencePanel({
  complianceId,
  calendarItemId,
  onClose,
  onComplete,
}: PanelProps) {
  const { state, uploadEvidence, markEvidenceComplete } = useITService();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const comp = getCompliance(complianceId);
  const focal = calendarItemId
    ? state.calendar.find((c) => c.id === calendarItemId)
    : findFocalCalendarItem(state.calendar, complianceId);

  const finish = () => {
    onComplete?.();
    onClose?.();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !state.profile) return;
    setErr(null);
    setBusy(true);
    try {
      const { valid, status } = validateUploadedEvidence(file.name, file.type);
      if (!valid) {
        setErr("Use PDF, DOCX, XLSX, PNG or JPEG.");
        return;
      }
      uploadEvidence({
        companyId: state.profile.companyId,
        complianceId,
        calendarItemId,
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        validationStatus: status,
        source: "upload",
      });
      finish();
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleMarkDone = () => {
    if (!state.profile) return;
    setErr(null);
    setBusy(true);
    try {
      markEvidenceComplete({
        companyId: state.profile.companyId,
        complianceId,
        calendarItemId,
      });
      finish();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-3">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="text-[12px] font-bold text-ink">{comp?.name}</div>
          {focal && (
            <div className="mt-0.5 text-[11px] text-ink-3">
              {focal.period} · Due {focal.dueDate}
            </div>
          )}
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-ink-4 hover:bg-surface-2 hover:text-ink"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={handleFile}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Btn
          variant="o"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="justify-center !py-2 !text-[12px]"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="h-3.5 w-3.5" />
          )}
          Upload file
        </Btn>

        <button
          type="button"
          disabled={busy}
          onClick={handleMarkDone}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-[12px] font-semibold text-success transition hover:bg-success/10 disabled:opacity-50"
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Already done
        </button>
      </div>

      <p className="mt-2 text-[10px] leading-snug text-ink-4">
        Upload proof, or confirm it&apos;s already fulfilled — no separate page needed.
      </p>

      {err && <p className="mt-2 text-[11px] text-destructive">{err}</p>}
    </div>
  );
}

type ActionsProps = {
  complianceId: string;
  existingEvidence?: EvidenceRecord;
};

export function ComplianceEvidenceActions({ complianceId, existingEvidence }: ActionsProps) {
  const [open, setOpen] = useState(false);
  const hasEvidence = !!existingEvidence;

  if (hasEvidence && !open) {
    const label =
      existingEvidence.source === "attestation"
        ? "Marked complete"
        : existingEvidence.filename.length > 22
          ? `${existingEvidence.filename.slice(0, 20)}…`
          : existingEvidence.filename;
    return (
      <div className="text-right">
        <div className="max-w-[140px] truncate text-[11px] font-medium text-success" title={existingEvidence.filename}>
          {label}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-0.5 text-[11px] font-bold text-primary hover:underline"
        >
          Update →
        </button>
      </div>
    );
  }

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-[11px] font-bold text-primary hover:underline"
      >
        {open ? "Cancel" : "Upload →"}
      </button>
      {open && (
        <div className="mt-2 text-left">
          <ComplianceEvidencePanel
            complianceId={complianceId}
            onClose={() => setOpen(false)}
            onComplete={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
