import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, X, FileText, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Btn, Pill } from "./ui-kit";
import { uploadDocument, listExtractionJobs } from "@/lib/books.functions";

const KINDS = [
  { id: "bank_statement", label: "Bank statement" },
  { id: "invoice", label: "Sales invoice" },
  { id: "bill", label: "Vendor bill" },
  { id: "receipt", label: "Receipt" },
  { id: "contract", label: "Contract" },
  { id: "other", label: "Other" },
] as const;

type Kind = (typeof KINDS)[number]["id"];

export function UploadDrawer({
  open,
  onOpenChange,
  defaultKind = "bank_statement",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultKind?: Kind;
}) {
  const [kind, setKind] = useState<Kind>(defaultKind);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const upload = useServerFn(uploadDocument);
  const list = useServerFn(listExtractionJobs);

  const jobsQuery = useQuery({
    queryKey: ["extraction-jobs"],
    queryFn: () => list(),
    refetchInterval: open ? 4000 : false,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      return upload({ data: fd });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["extraction-jobs"] });
      qc.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => mutation.mutate(f));
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/40 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-surface shadow-card-md">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <div className="text-[14px] font-semibold text-ink">Upload & ingest</div>
            <div className="text-[11px] text-ink-4">Documents are parsed by AI into your books.</div>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1.5 text-ink-4 hover:bg-surface-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <label className="block text-[11px] font-medium uppercase tracking-[0.08em] text-ink-4">
            Document type
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k.id}
                onClick={() => setKind(k.id)}
                className={`rounded-md border px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                  kind === k.id
                    ? "border-primary-border bg-primary-muted text-primary"
                    : "border-border bg-surface-2 text-ink-3 hover:bg-surface-3"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              onFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
            className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-10 text-center transition-colors ${
              drag ? "border-primary bg-primary-muted/40" : "border-border hover:border-primary/50 hover:bg-surface-2"
            }`}
          >
            <Upload className="h-6 w-6 text-ink-4" />
            <div className="mt-3 text-[13px] font-medium text-ink">Drop files or click to browse</div>
            <div className="mt-1 text-[11px] text-ink-4">PDF, CSV, XLSX, JPG, PNG · up to 25 MB</div>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.csv,.xlsx,.xls,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>

          {mutation.isError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive-border/60 bg-destructive-muted/40 px-3 py-2 text-[12px] text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
              <span>{(mutation.error as Error)?.message || "Upload failed."}</span>
            </div>
          )}

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-ink-4">
                Recent extraction jobs
              </div>
              {jobsQuery.isFetching && <Loader2 className="h-3 w-3 animate-spin text-ink-4" />}
            </div>
            <div className="space-y-1.5">
              {(jobsQuery.data?.jobs || []).length === 0 ? (
                <div className="rounded-lg border border-border bg-surface-2 px-3 py-3 text-[12px] text-ink-4">
                  No jobs yet. Upload a document to see ingestion progress here.
                </div>
              ) : (
                jobsQuery.data!.jobs.map((j: any) => (
                  <div key={j.id} className="flex items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-3.5 w-3.5 flex-shrink-0 text-ink-4" />
                      <div className="truncate">
                        <div className="truncate text-[12px] font-medium text-ink">{j.kind}</div>
                        <div className="text-[10px] text-ink-4">{new Date(j.created_at).toLocaleString("en-IN")}</div>
                      </div>
                    </div>
                    <JobPill status={j.status} rows={j.rows_extracted} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-border px-5 py-3 text-[11px] text-ink-4">
          AI extraction runs in the background. Reload the page in ~30 seconds to see new transactions.
        </div>
      </div>
    </div>
  );
}

function JobPill({ status, rows }: { status: string; rows?: number }) {
  if (status === "done") return <Pill tone="done"><CheckCircle2 className="h-3 w-3" /> {rows || 0} rows</Pill>;
  if (status === "failed") return <Pill tone="miss"><AlertTriangle className="h-3 w-3" /> failed</Pill>;
  if (status === "running") return <Pill tone="infra"><Loader2 className="h-3 w-3 animate-spin" /> parsing</Pill>;
  return <Pill tone="pend">queued</Pill>;
}

/** Convenience button that opens the drawer. Use anywhere. */
export function UploadButton({ kind, label = "Upload & ingest" }: { kind?: Kind; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Btn onClick={() => setOpen(true)}>
        <Upload className="h-4 w-4" /> {label}
      </Btn>
      <UploadDrawer open={open} onOpenChange={setOpen} defaultKind={kind} />
    </>
  );
}
