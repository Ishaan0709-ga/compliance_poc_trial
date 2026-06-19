import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Pill, Btn } from "@/components/ui-kit";
import { Plug, Check, Search, RefreshCw, Unplug } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getZohoAuthUrl, getZohoStatus, syncZohoInvoices, disconnectZoho } from "@/lib/zoho.functions";
import { getGoogleDriveStatus, listGoogleDriveFiles } from "@/lib/gdrive.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/founder/books/connectors")({
  head: () => ({ meta: [{ title: "Connectors — ComplyOS" }] }),
  component: Connectors,
});

type Status = "connected" | "available" | "syncing";
interface App { name: string; cat: string; desc: string; status: Status; last?: string; logo: string; color: string }

const APPS: App[] = [
  { name: "HDFC Bank", cat: "Banking", desc: "Live feed · Current a/c ••4218", status: "connected", last: "synced 4 min ago", logo: "H", color: "bg-[#004C8F]" },
  { name: "ICICI Bank", cat: "Banking", desc: "EEFC USD account ••0921", status: "connected", last: "synced 12 min ago", logo: "I", color: "bg-[#F37920]" },
  { name: "Razorpay", cat: "Payments", desc: "Auto-pull settlements & fees", status: "connected", last: "live", logo: "R", color: "bg-[#3395FF]" },
  { name: "Stripe", cat: "Payments", desc: "USD payouts + invoice sync", status: "syncing", last: "initial sync 64%", logo: "S", color: "bg-[#635BFF]" },
  { name: "Tally Prime", cat: "Accounting", desc: "Two-way ledger sync via Tally Connector", status: "connected", last: "synced 1h ago", logo: "T", color: "bg-[#1B7A3D]" },
  { name: "QuickBooks", cat: "Accounting", desc: "GL sync for global subsidiaries", status: "available", logo: "Q", color: "bg-[#2CA01C]" },
  { name: "GST Portal (GSTN)", cat: "Government", desc: "GSTR-1/3B/2B fetch & file via GSP", status: "connected", last: "GSTR-2B fetched today", logo: "G", color: "bg-[#0F3D7E]" },
  { name: "MCA21 / V3", cat: "Government", desc: "ROC filings & DIN/DSC management", status: "connected", last: "linked", logo: "M", color: "bg-[#A02338]" },
  { name: "TRACES", cat: "Government", desc: "TDS returns & Form 16/16A", status: "available", logo: "T", color: "bg-[#1F4A8E]" },
  { name: "Income Tax — eFiling", cat: "Government", desc: "ITR filing, refunds, intimations", status: "available", logo: "₹", color: "bg-[#0F3D7E]" },
  { name: "EPFO Unified", cat: "Government", desc: "PF challans & ECR upload", status: "available", logo: "E", color: "bg-[#A02338]" },
  { name: "Razorpay X Payroll", cat: "Payroll", desc: "Salaries, PF, ESI, PT — one click", status: "connected", last: "May run scheduled", logo: "X", color: "bg-[#0E1330]" },
  { name: "Keka HR", cat: "Payroll", desc: "Headcount + payroll inputs", status: "available", logo: "K", color: "bg-[#5E5DF0]" },
  { name: "Shopify", cat: "E-commerce", desc: "Orders → invoices, COGS sync", status: "available", logo: "S", color: "bg-[#95BF47]" },
  { name: "Amazon Seller Central", cat: "E-commerce", desc: "Settlement reports & fees", status: "available", logo: "A", color: "bg-[#FF9900]" },
  { name: "Stripe Tax", cat: "Tax", desc: "Auto-compute sales tax for exports", status: "available", logo: "T", color: "bg-[#635BFF]" },
  { name: "Slack", cat: "Communication", desc: "Approvals & alerts in #finance", status: "available", logo: "#", color: "bg-[#4A154B]" },
];

const CATS = ["All", "Banking", "Payments", "Accounting", "Storage", "Government", "Payroll", "E-commerce", "Tax", "Communication"];

function ZohoCard() {
  const getUrl = useServerFn(getZohoAuthUrl);
  const getStatus = useServerFn(getZohoStatus);
  const sync = useServerFn(syncZohoInvoices);
  const disconnect = useServerFn(disconnectZoho);
  const [status, setStatus] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try { setStatus(await getStatus()); } catch {}
  };

  useEffect(() => {
    refresh();
    const params = new URLSearchParams(window.location.search);
    if (params.get("zoho") === "success") toast.success("Zoho Books connected");
    if (params.get("zoho") === "error") toast.error(`Zoho: ${params.get("msg")}`);
  }, []);

  const connect = async () => {
    setBusy(true);
    try {
      const { url } = await getUrl();
      window.location.href = url;
    } catch (e: any) { toast.error(e.message); setBusy(false); }
  };

  const doSync = async () => {
    setBusy(true);
    try {
      const { synced } = await sync();
      toast.success(`Synced ${synced} invoices`);
      await refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const doDisconnect = async () => {
    setBusy(true);
    try { await disconnect(); toast.success("Disconnected"); await refresh(); }
    catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  const connected = !!status?.connected;

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold text-white bg-[#E42527]">Z</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[14px] font-medium text-ink">Zoho Books</div>
            <Pill tone="n">Accounting</Pill>
          </div>
          <div className="mt-1 text-[12px] text-ink-3">
            {connected
              ? `${status.organization_name || "Org"} · ${status.invoiceCount} invoices cached`
              : "Live OAuth · pulls invoices from Zoho Books (region .in)"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {connected ? (
          <span className="flex items-center gap-1 text-[11px] text-success">
            <Check className="h-3 w-3" /> connected
          </span>
        ) : (
          <span className="text-[11px] text-ink-4">Not connected</span>
        )}
        <div className="flex gap-2">
          {connected ? (
            <>
              <Btn variant="o" onClick={doSync} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> Sync</Btn>
              <Btn variant="o" onClick={doDisconnect} disabled={busy}><Unplug className="h-3.5 w-3.5" /> Disconnect</Btn>
            </>
          ) : (
            <Btn onClick={connect} disabled={busy}>Connect</Btn>
          )}
        </div>
      </div>
    </Card>
  );
}

function GoogleDriveCard() {
  const getStatus = useServerFn(getGoogleDriveStatus);
  const listFiles = useServerFn(listGoogleDriveFiles);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getStatus().then((s) => setConnected(!!s.connected)).catch(() => setConnected(false));
  }, []);

  const refresh = async () => {
    setBusy(true);
    try {
      const { files } = await listFiles();
      setCount(files.length);
      toast.success(`Loaded ${files.length} recent files`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold text-white bg-[#1FA463]">D</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="text-[14px] font-medium text-ink">Google Drive</div>
            <Pill tone="n">Storage</Pill>
          </div>
          <div className="mt-1 text-[12px] text-ink-3">
            {connected
              ? count !== null ? `${count} recent files loaded` : "Connected · pull docs into Vault"
              : connected === false ? "Not connected" : "Checking…"}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {connected ? (
          <span className="flex items-center gap-1 text-[11px] text-success"><Check className="h-3 w-3" /> connected</span>
        ) : (
          <span className="text-[11px] text-ink-4">{connected === false ? "Not connected" : "—"}</span>
        )}
        {connected && (
          <Btn variant="o" onClick={refresh} disabled={busy}><RefreshCw className="h-3.5 w-3.5" /> List files</Btn>
        )}
      </div>
    </Card>
  );
}

function Connectors() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const list = APPS.filter((a) =>
    (cat === "All" || a.cat === cat) && (q === "" || a.name.toLowerCase().includes(q.toLowerCase()))
  );
  const showZoho = (cat === "All" || cat === "Accounting") && (q === "" || "zoho books".includes(q.toLowerCase()));
  const showGDrive = (cat === "All" || cat === "Storage") && (q === "" || "google drive".includes(q.toLowerCase()));
  return (
    <PortalShell portalId="founder">
      <PageHeader
        title="App connectors"
        subtitle="Connect your stack · 60+ integrations · OAuth & GSP-certified"
        actions={<Btn variant="o"><Plug className="h-4 w-4" /> Request integration</Btn>}
      />
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-card">
        <Search className="h-4 w-4 text-ink-4" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search integrations…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink-4"
        />
      </div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3 py-1 text-[12px] transition ${
              c === cat ? "bg-primary text-primary-foreground" : "border border-border bg-surface text-ink-3 hover:bg-surface-2"
            }`}
          >{c}</button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {showZoho && <ZohoCard />}
        {showGDrive && <GoogleDriveCard />}
        {list.map((a) => (
          <Card key={a.name}>
            <div className="flex items-start gap-3">
              <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-[15px] font-semibold text-white ${a.color}`}>
                {a.logo}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[14px] font-medium text-ink">{a.name}</div>
                  <Pill tone="n">{a.cat}</Pill>
                </div>
                <div className="mt-1 text-[12px] text-ink-3">{a.desc}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              {a.status === "connected" ? (
                <span className="flex items-center gap-1 text-[11px] text-success">
                  <Check className="h-3 w-3" /> {a.last}
                </span>
              ) : a.status === "syncing" ? (
                <Pill tone="pend">{a.last}</Pill>
              ) : (
                <span className="text-[11px] text-ink-4">Not connected</span>
              )}
              {a.status === "connected" ? (
                <Btn variant="o">Manage</Btn>
              ) : (
                <Btn>Connect</Btn>
              )}
            </div>
          </Card>
        ))}
      </div>
    </PortalShell>
  );
}
