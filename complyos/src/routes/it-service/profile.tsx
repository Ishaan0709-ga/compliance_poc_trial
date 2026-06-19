import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, Server } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Btn } from "@/components/ui-kit";
import { useITService } from "@/lib/it-service/context";
import { createCompanyId } from "@/lib/it-service/storage";
import type { CompanyProfile, EntityType } from "@/lib/it-service/types";

export const Route = createFileRoute("/it-service/profile")({
  head: () => ({
    meta: [{ title: "Company Profile — IT Service — ComplyOS" }],
  }),
  component: ProfilePage,
});

const REVENUE_BANDS = ["<40L", "40L-1Cr", "1-5Cr", "5-50Cr", "50Cr+"];

function ProfilePage() {
  const navigate = useNavigate();
  const { setProfile, state } = useITService();
  const [entityType, setEntityType] = useState<EntityType>("private_limited");

  useEffect(() => {
    if (state.profile) {
      setEntityType(state.profile.entityType);
      setForm({
        companyName: state.profile.companyName,
        revenueBand: state.profile.revenueBand,
        employeeCount: state.profile.employeeCount,
        womenEmployees: state.profile.womenEmployees,
        gstRegistered: state.profile.gstRegistered,
        countriesServed: state.profile.countriesServed.join(", "),
        handlesPersonalData: state.profile.handlesPersonalData,
        financialYearStart: state.profile.financialYearStart,
        primaryContact: state.profile.primaryContact,
      });
      return;
    }
    const stored = sessionStorage.getItem("its-entity-type") as EntityType | null;
    if (stored) setEntityType(stored);
    else navigate({ to: "/it-service/onboarding" });
  }, [navigate, state.profile]);

  const [form, setForm] = useState({
    companyName: "",
    revenueBand: "1-5Cr",
    employeeCount: 50,
    womenEmployees: 10,
    gstRegistered: true,
    countriesServed: "India, US",
    handlesPersonalData: true,
    financialYearStart: 4,
    primaryContact: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date().toISOString();
    const profile: CompanyProfile = {
      companyId: state.profile?.companyId || createCompanyId(),
      companyName: form.companyName,
      entityType,
      industry: "IT Service",
      revenueBand: form.revenueBand,
      employeeCount: form.employeeCount,
      womenEmployees: form.womenEmployees,
      gstRegistered: form.gstRegistered,
      countriesServed: form.countriesServed.split(",").map((c) => c.trim()).filter(Boolean),
      handlesPersonalData: form.handlesPersonalData,
      financialYearStart: form.financialYearStart,
      primaryContact: form.primaryContact,
      onboardingComplete: true,
      createdAt: state.profile?.createdAt || now,
      updatedAt: now,
    };
    setProfile(profile);
    sessionStorage.removeItem("its-entity-type");
    navigate({ to: "/it-service/dashboard" });
  };

  const field = (
    label: string,
    children: React.ReactNode,
    hint?: string
  ) => (
    <div>
      <label className="mb-1.5 block text-[12px] font-semibold text-white/80">{label}</label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-onboard text-white">
      <header className="flex items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-primary text-primary-foreground">
            <ShieldCheck className="h-4 w-4" strokeWidth={2.4} />
          </div>
          <span className="text-[16px] font-extrabold tracking-[-0.03em]">
            Comply<span className="text-[oklch(0.78_0.12_265)]">OS</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold">
          <Server className="h-3.5 w-3.5" />
          Company Profile
        </div>
      </header>

      <div className="mx-auto w-full max-w-2xl flex-1 px-6 pb-20 pt-4">
        <h1 className="text-[32px] font-extrabold tracking-[-0.03em]">Company profile</h1>
        <p className="mt-2 text-[14px] text-white/60">
          This profile drives your applicable compliances, calendar, scores and AI insights.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          {field(
            "Company name",
            <input
              required
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none placeholder:text-white/30"
              placeholder="ABC Technologies Pvt Ltd"
            />
          )}
          {field(
            "Entity type",
            <input
              readOnly
              value={entityType.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] text-white/70"
            />
          )}
          {field(
            "Industry",
            <input
              readOnly
              value="IT Service"
              className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-[14px] text-white/70"
            />
          )}
          {field(
            "Revenue band",
            <select
              value={form.revenueBand}
              onChange={(e) => setForm({ ...form, revenueBand: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
            >
              {REVENUE_BANDS.map((b) => (
                <option key={b} value={b} className="text-ink">
                  {b}
                </option>
              ))}
            </select>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {field(
              "Employee count",
              <input
                type="number"
                min={0}
                required
                value={form.employeeCount}
                onChange={(e) => setForm({ ...form, employeeCount: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              />
            )}
            {field(
              "Women employees",
              <input
                type="number"
                min={0}
                required
                value={form.womenEmployees}
                onChange={(e) => setForm({ ...form, womenEmployees: Number(e.target.value) })}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              />
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {field(
              "GST registered",
              <select
                value={form.gstRegistered ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, gstRegistered: e.target.value === "yes" })}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              >
                <option value="yes" className="text-ink">Yes</option>
                <option value="no" className="text-ink">No</option>
              </select>
            )}
            {field(
              "Handles personal data",
              <select
                value={form.handlesPersonalData ? "yes" : "no"}
                onChange={(e) => setForm({ ...form, handlesPersonalData: e.target.value === "yes" })}
                className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              >
                <option value="yes" className="text-ink">Yes</option>
                <option value="no" className="text-ink">No</option>
              </select>
            )}
          </div>
          {field(
            "Countries served",
            <input
              required
              value={form.countriesServed}
              onChange={(e) => setForm({ ...form, countriesServed: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              placeholder="India, US, EU"
            />
          )}
          {field(
            "Financial year start (month)",
            <select
              value={form.financialYearStart}
              onChange={(e) => setForm({ ...form, financialYearStart: Number(e.target.value) })}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
            >
              {[
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December",
              ].map((m, i) => (
                <option key={m} value={i + 1} className="text-ink">
                  {m}
                </option>
              ))}
            </select>
          )}
          {field(
            "Primary contact",
            <input
              required
              value={form.primaryContact}
              onChange={(e) => setForm({ ...form, primaryContact: e.target.value })}
              className="w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-[14px] outline-none"
              placeholder="Name, email or phone"
            />
          )}

          <Btn
            type="submit"
            className="w-full justify-center !bg-primary !py-3 !text-[14px] !text-primary-foreground"
          >
            Save & generate compliance calendar
          </Btn>
        </form>
      </div>
    </div>
  );
}
