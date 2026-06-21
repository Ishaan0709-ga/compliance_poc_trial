import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Sparkles, Bot, Zap, CheckCircle2 } from "lucide-react";
import { INDUSTRIES } from "@/lib/industries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ComplyOS — AI Agent Orchestration for Industry Compliance" },
      {
        name: "description",
        content:
          "Specialized AI agents for Healthcare, Fintech, IT, MSME and Government compliance. Auto-reporting, auto-approval, continuous monitoring.",
      },
      { property: "og:title", content: "ComplyOS — Compliance, on autopilot" },
      {
        property: "og:description",
        content:
          "AI agent orchestration on top of industry-specific regulatory data. Pick your vertical to begin.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-onboard text-white">
        <div className="absolute inset-0 grid-bg pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,oklch(0.51_0.21_265/0.4),transparent)] pointer-events-none" />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
            </div>
            <span className="text-[20px] font-extrabold tracking-[-0.03em]">
              Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
            </span>
          </div>
          <nav className="hidden items-center gap-6 text-[13px] text-white/70 md:flex">
            <a href="#industries" className="hover:text-white">Industries</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#agents" className="hover:text-white">Agents</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/it-service/login"
              className="hidden rounded-lg border border-white/15 px-3.5 py-2 text-[12px] font-bold text-white/80 backdrop-blur transition-colors hover:bg-white/10 sm:inline-flex"
            >
              IT Service
            </Link>
            <Link
              to="/login"
              search={{ mode: "signin" }}
              className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-[13px] font-bold backdrop-blur transition-colors hover:bg-white/15"
            >
              Sign in
            </Link>
            <Link
              to="/login"
              search={{ mode: "signup" }}
              className="rounded-lg bg-primary px-3.5 py-2 text-[13px] font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-12 md:pt-20">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[oklch(0.82_0.1_265)] backdrop-blur">
              <Sparkles className="h-3 w-3" /> AI Agent Orchestration Layer
            </div>
            <h1 className="text-[44px] font-extrabold leading-[1.05] tracking-[-0.04em] md:text-[64px]">
              Compliance, <span className="bg-gradient-to-r from-[oklch(0.78_0.12_265)] to-[oklch(0.85_0.15_295)] bg-clip-text text-transparent">on autopilot</span>
              <br />for every regulated vertical.
            </h1>
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/65 md:text-[17px]">
              Specialized AI agents trained on industry-specific regulatory data — RBI,
              HIPAA, ISO 27001, GST, MCA — that monitor controls, file returns, and
              auto-approve routine cases. Humans handle exceptions.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#industries"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-[14px] font-bold transition-all hover:bg-primary/90"
              >
                Choose your industry
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-[14px] font-bold backdrop-blur hover:bg-white/10"
              >
                See orchestration in action
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[12px] text-white/50">
              {[
                "RBI · SEBI · PMLA · DPDP",
                "HIPAA · NDHM · NABH",
                "ISO 27001 · SOC 2 · GDPR",
                "GST · MCA · EPFO · DBT",
              ].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[oklch(0.7_0.18_160)]" />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              Industry Verticals
            </div>
            <h2 className="mt-2 text-[32px] font-extrabold tracking-[-0.03em] text-ink md:text-[40px]">
              Pick the dashboard built for your regulators.
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {INDUSTRIES.map((ind, i) => {
            const Icon = ind.icon;
            return (
              <motion.div
                key={ind.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  to={ind.route}
                  className="group relative block overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-primary-border hover:shadow-card-md"
                >
                  <div
                    className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${ind.ringFrom} opacity-60 blur-2xl transition-opacity group-hover:opacity-100`}
                  />
                  <div className="relative">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 ${ind.accent}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] font-bold text-ink-4">
                          SCORE
                        </div>
                        <div className="text-[24px] font-extrabold tracking-[-0.03em] text-ink">
                          {ind.score}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-[20px] font-extrabold tracking-[-0.02em] text-ink">
                      {ind.name}
                    </h3>
                    <p className="mt-1 text-[12px] font-medium text-ink-4">
                      {ind.tagline}
                    </p>
                    <p className="mt-3 text-[13px] leading-relaxed text-ink-3">
                      {ind.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {ind.regulators.map((r) => (
                        <span
                          key={r}
                          className="rounded-md border border-border bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-3"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-purple">
                        <Bot className="h-3.5 w-3.5" />
                        {ind.agents} agents
                      </div>
                      <div className="flex items-center gap-1 text-[13px] font-bold text-primary">
                        Open dashboard
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-border bg-surface-2/50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
              The orchestration layer
            </div>
            <h2 className="mt-2 text-[32px] font-extrabold tracking-[-0.03em] text-ink md:text-[40px]">
              One conductor. Many specialized agents.
            </h2>
            <p className="mt-3 text-[15px] text-ink-3">
              Each industry gets a roster of agents trained on the exact regulatory corpus —
              circulars, gazette notifications, audit findings — that matter to your business.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Ingest",
                body: "Connectors pull data from your stack — Tally, Zoho, Razorpay, GSTN, EHR, AWS — every 15 minutes.",
              },
              {
                icon: Bot,
                title: "Orchestrate",
                body: "A planner agent decomposes obligations into tasks, assigns to specialist agents, monitors progress.",
              },
              {
                icon: CheckCircle2,
                title: "Auto-resolve",
                body: "Routine filings, renewals, reconciliations are auto-approved. Exceptions route to your team.",
              },
            ].map((step) => {
              const I = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-card"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-muted text-primary">
                    <I className="h-5 w-5" />
                  </div>
                  <div className="text-[18px] font-extrabold tracking-[-0.02em] text-ink">
                    {step.title}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
                    {step.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-surface px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-[12px] text-ink-4 md:flex-row">
          <div>© {new Date().getFullYear()} ComplyOS · Built for regulated businesses.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-ink-2">Security</a>
            <a href="#" className="hover:text-ink-2">DPDP</a>
            <a href="#" className="hover:text-ink-2">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
