import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, CheckCircle2, Loader2, Cpu, Zap } from "lucide-react";

export interface AgentTask {
  id: string;
  agent: string;
  task: string;
  status: "queued" | "running" | "done";
  reasoning?: string;
}

interface AgentOrchestrationPanelProps {
  industry: string;
  agents: { name: string; role: string; status: "idle" | "busy" | "review" }[];
  initialTasks: AgentTask[];
}

export function AgentOrchestrationPanel({
  industry,
  agents,
  initialTasks,
}: AgentOrchestrationPanelProps) {
  const [tasks, setTasks] = useState<AgentTask[]>(initialTasks);

  // animate task progression
  useEffect(() => {
    const t = setInterval(() => {
      setTasks((prev) => {
        const idx = prev.findIndex((x) => x.status !== "done");
        if (idx === -1) return prev;
        const next = [...prev];
        if (next[idx].status === "queued") next[idx] = { ...next[idx], status: "running" };
        else if (next[idx].status === "running")
          next[idx] = { ...next[idx], status: "done" };
        return next;
      });
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const statusMap = {
    idle: { color: "bg-ink-4", label: "Idle" },
    busy: { color: "bg-success animate-pulse", label: "Working" },
    review: { color: "bg-warning", label: "Needs review" },
  } as const;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-[13px] font-extrabold tracking-[-0.02em]">
              AI Agent Orchestration
            </div>
            <div className="text-[11px] text-ink-4">
              {industry} compliance · {agents.length} specialized agents
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-success-border bg-success-muted px-2.5 py-1 text-[10px] font-bold text-success">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          LIVE
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-[260px_1fr]">
        {/* Agents */}
        <div className="border-b border-border p-3 md:border-b-0 md:border-r">
          <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
            Active agents
          </div>
          <div className="space-y-1">
            {agents.map((a) => (
              <div
                key={a.name}
                className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-2"
              >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary-muted text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-bold text-ink">{a.name}</div>
                  <div className="truncate text-[10px] text-ink-4">{a.role}</div>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusMap[a.status].color}`} />
                  <span className="text-[9px] font-bold uppercase text-ink-4">
                    {statusMap[a.status].label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task stream */}
        <div className="p-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
              Reasoning stream
            </div>
            <div className="flex items-center gap-1 text-[10px] text-ink-4">
              <Cpu className="h-3 w-3" /> gpt-5 · gemini-3-pro
            </div>
          </div>
          <div className="max-h-[320px] space-y-1.5 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {tasks.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-border bg-surface-2/50 p-2.5"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">
                      {t.status === "done" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" />
                      ) : t.status === "running" ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <Zap className="h-4 w-4 text-ink-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-primary">
                          {t.agent}
                        </span>
                        <span className="text-[10px] text-ink-4">
                          {t.status === "done"
                            ? "completed"
                            : t.status === "running"
                              ? "executing"
                              : "queued"}
                        </span>
                      </div>
                      <div className="mt-0.5 text-[12px] text-ink-2">{t.task}</div>
                      {t.reasoning && t.status !== "queued" && (
                        <div className="mt-1 rounded border-l-2 border-primary/40 bg-surface px-2 py-1 font-mono text-[10px] leading-relaxed text-ink-3">
                          → {t.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
