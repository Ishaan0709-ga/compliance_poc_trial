import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PortalShell } from "@/components/PortalShell";
import { Card, Btn, PageHeader, Pill } from "@/components/ui-kit";
import { Upload, FileText, Folder, Sparkles, Search, Loader2, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getVaultDownloadUrl, uploadVaultDocument } from "@/lib/vault.functions";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/founder/vault")({
  head: () => ({ meta: [{ title: "Document Vault — Grae" }] }),
  component: Vault,
});

const CATEGORIES = [
  "Incorporation", "ROC / MCA", "GST", "Income Tax",
  "Funding & Equity", "Contracts", "HR & Payroll", "Bank statements", "Other",
] as const;

interface Doc {
  id: string;
  file_name: string;
  s3_key: string;
  size_bytes: number | null;
  mime_type: string | null;
  doc_type: string | null;
  category: string | null;
  ai_confidence: number | null;
  ai_summary: string | null;
  created_at: string;
}

function fmtSize(n: number | null) {
  if (!n) return "";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function Vault() {
  const [userId, setUserId] = useState<string | null>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setUserId(s?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("vault_documents")
      .select("id,file_name,s3_key,size_bytes,mime_type,doc_type,category,ai_confidence,ai_summary,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setDocs(data as Doc[]);
  }
  useEffect(() => { if (userId) load(); }, [userId]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    if (!userId) {
      toast.error("Please sign in before uploading documents.");
      return;
    }
    setUploading(true);
    setUploadStatus(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
    try {
      for (const file of Array.from(files)) {
        setUploadStatus(`Uploading ${file.name}…`);
        const form = new FormData();
        form.append("file", file);
        const row = await uploadVaultDocument({ data: form });
        toast.success(`${file.name} → ${row.doc_type || "Document"}`);
      }
      setUploadStatus("Refreshing vault…");
      await load();
    } catch (e: any) {
      toast.error(e.message || "Upload error");
    } finally {
      setUploading(false);
      setUploadStatus(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function download(d: Doc) {
    try {
      const { download_url } = await getVaultDownloadUrl({ data: { s3_key: d.s3_key } });
      window.open(download_url, "_blank");
    } catch (e: any) { toast.error(e.message); }
  }

  async function remove(d: Doc) {
    if (!confirm(`Delete ${d.file_name}?`)) return;
    const { error } = await supabase.from("vault_documents").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

  const filtered = docs.filter((d) =>
    (!cat || d.category === cat) &&
    (!q || (d.file_name + " " + (d.doc_type || "") + " " + (d.ai_summary || "")).toLowerCase().includes(q.toLowerCase()))
  );

  const counts = CATEGORIES.map((c) => ({ name: c, count: docs.filter((d) => d.category === c).length }));

  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="Document Vault"
        subtitle="Upload anything — AI auto-detects MoA, AoA, CIN, share certificates, GST returns and more."
        actions={
          <>
            <input ref={fileRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <Btn variant="o" onClick={() => toast.info("Auto-tagging runs on every upload")}>
              <Sparkles className="h-4 w-4" /> AI auto-tag
            </Btn>
            <Btn onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload
            </Btn>
          </>
        }
      />

      {!userId && (
        <div className="mb-4 rounded-xl border border-border bg-surface p-4 text-[13px] text-ink-3">
          Please <Link to="/login" className="text-primary underline">sign in</Link> to upload and manage your vault.
        </div>
      )}

      {uploadStatus && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary-muted/30 px-3 py-2 text-[13px] text-ink-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          {uploadStatus}
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card">
        <Search className="h-4 w-4 text-ink-4" />
        <input
          placeholder="Search documents…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-4"
        />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-5 lg:grid-cols-9">
        <div
          onClick={() => setCat(null)}
          className={`cursor-pointer rounded-xl border p-3 shadow-card hover:bg-surface-2 ${!cat ? "border-primary bg-primary-muted/40" : "border-border bg-surface"}`}
        >
          <Folder className="h-4 w-4 text-primary" />
          <div className="mt-2 text-[12px] font-medium text-ink">All</div>
          <div className="text-[11px] text-ink-4">{docs.length} files</div>
        </div>
        {counts.map((f) => (
          <div
            key={f.name}
            onClick={() => setCat(f.name)}
            className={`cursor-pointer rounded-xl border p-3 shadow-card hover:bg-surface-2 ${cat === f.name ? "border-primary bg-primary-muted/40" : "border-border bg-surface"}`}
          >
            <Folder className="h-4 w-4 text-primary" />
            <div className="mt-2 text-[12px] font-medium text-ink truncate">{f.name}</div>
            <div className="text-[11px] text-ink-4">{f.count} files</div>
          </div>
        ))}
      </div>

      <Card title={cat ? `${cat} (${filtered.length})` : `All documents (${filtered.length})`}>
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-ink-4">
            {docs.length === 0 ? "No documents yet — upload your CIN, MoA, AoA, share certificates and more." : "No matches."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-muted/60">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-ink">{d.file_name}</div>
                    <div className="truncate text-[11px] text-ink-4">
                      {d.ai_summary || `Auto-tagged · ${new Date(d.created_at).toLocaleDateString()} · ${fmtSize(d.size_bytes)}`}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {d.doc_type && <Pill tone="n">{d.doc_type}</Pill>}
                  {d.ai_confidence != null && (
                    <span className="font-mono text-[10px] text-ink-4">{Math.round(d.ai_confidence * 100)}%</span>
                  )}
                  <button onClick={() => download(d)} className="rounded-md border border-border bg-surface p-1.5 text-ink-3 hover:bg-surface-2" title="Download">
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => remove(d)} className="rounded-md border border-border bg-surface p-1.5 text-ink-3 hover:bg-surface-2" title="Delete">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </PortalShell>
  );
}
