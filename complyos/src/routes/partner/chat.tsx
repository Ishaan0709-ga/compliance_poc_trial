import { createFileRoute } from "@tanstack/react-router";
import { PortalShell } from "@/components/PortalShell";
import { Card, PageHeader, Btn } from "@/components/ui-kit";
import { Send, Paperclip } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/partner/chat")({
  head: () => ({ meta: [{ title: "Client Chat — ComplyOS" }] }),
  component: Chat,
});

const THREADS = [
  { c: "Riya Mehta", o: "Lumen Labs · FMB-2419", last: "Sharing the Apr bank statement now…", time: "10m", unread: 2 },
  { c: "Suresh K", o: "Hiveloop · FMB-2410", last: "Need clarification on 80JJAA deduction.", time: "2h", unread: 1 },
  { c: "Maya Sen", o: "Saffron Studios · FMB-2399", last: "Filed already? Thanks!", time: "1d", unread: 0 },
];

function Chat() {
  const [active, setActive] = useState(0);
  const t = THREADS[active];
  return (
    <PortalShell portalId="partner">
      <PageHeader title="Client chat" subtitle="Threaded conversations linked to each order." />
      <div className="grid h-[60vh] gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="!p-0 overflow-hidden">
          <div className="divide-y divide-border">
            {THREADS.map((th, i) => (
              <button
                key={th.c}
                onClick={() => setActive(i)}
                className={`flex w-full items-start gap-3 p-3 text-left ${i === active ? "bg-primary-muted/40" : "hover:bg-surface-2"}`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-brand text-[11px] font-medium text-white">
                  {th.c.split(" ").map((s) => s[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-[12.5px] font-medium text-ink">{th.c}</div>
                    <div className="text-[10px] text-ink-4">{th.time}</div>
                  </div>
                  <div className="text-[10px] text-ink-4">{th.o}</div>
                  <div className="mt-1 truncate text-[12px] text-ink-3">{th.last}</div>
                </div>
                {th.unread > 0 && (
                  <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">{th.unread}</span>
                )}
              </button>
            ))}
          </div>
        </Card>
        <Card className="flex flex-col !p-0 overflow-hidden">
          <div className="border-b border-border p-3">
            <div className="text-[13px] font-medium text-ink">{t.c}</div>
            <div className="text-[11px] text-ink-4">{t.o}</div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            <Bubble who="them" t="Hi Neha, sharing the April bank statement now." />
            <Bubble who="them" t="HDFC current account · 1 attachment" />
            <Bubble who="me" t="Got it. I'll reconcile and have the GSTR-3B draft ready by tomorrow EOD." />
            <Bubble who="them" t="Perfect, thanks!" />
          </div>
          <div className="flex items-center gap-2 border-t border-border p-2">
            <Btn variant="g"><Paperclip className="h-4 w-4" /></Btn>
            <input placeholder="Reply…" className="flex-1 bg-transparent px-2 text-[13px] outline-none" />
            <Btn><Send className="h-3.5 w-3.5" /></Btn>
          </div>
        </Card>
      </div>
    </PortalShell>
  );
}

function Bubble({ who, t }: { who: "me" | "them"; t: string }) {
  return (
    <div className={`flex ${who === "me" ? "justify-end" : ""}`}>
      <div className={`max-w-[70%] rounded-xl px-3 py-2 text-[13px] ${
        who === "me" ? "bg-primary text-primary-foreground" : "border border-border bg-surface-2 text-ink-2"
      }`}>{t}</div>
    </div>
  );
}
