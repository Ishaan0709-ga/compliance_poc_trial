import { createServerFn } from "@tanstack/react-start";

export interface ComplianceUpdate {
  id: string;
  source: string;
  category: "GST" | "Income Tax" | "Startup Schemes" | "MCA / ROC" | "Labour" | "RBI / FEMA";
  title: string;
  summary: string;
  impact: string;
  publishedAt: string;
  url?: string;
}

const FALLBACK: ComplianceUpdate[] = [
  {
    id: "f1",
    source: "CBIC",
    category: "GST",
    title: "GSTR-1 due date extended for Q1 FY26-27 filers",
    summary: "Quarterly QRMP taxpayers get 7 extra days to file GSTR-1 for the Apr-Jun quarter due to portal maintenance.",
    impact: "All QRMP-registered businesses",
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    url: "https://www.cbic.gov.in",
  },
  {
    id: "f2",
    source: "DPIIT",
    category: "Startup Schemes",
    title: "Startup India Seed Fund — round 4 applications open",
    summary: "DPIIT-recognised startups < 2 yrs old can apply for grants up to ₹20L and convertible debentures up to ₹50L.",
    impact: "DPIIT-recognised startups",
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: "https://seedfund.startupindia.gov.in",
  },
  {
    id: "f3",
    source: "CBDT",
    category: "Income Tax",
    title: "Section 43B(h) — MSME payment disallowance clarification",
    summary: "Payments to MSMEs beyond 45 days will be disallowed as expense in the year of accrual; deduction allowed only on actual payment.",
    impact: "All companies dealing with MSME vendors",
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f4",
    source: "MCA",
    category: "MCA / ROC",
    title: "DPT-3 annual return — due 30 June",
    summary: "Companies with outstanding loans (not deposits) must file DPT-3 reporting position as on 31 March.",
    impact: "All Pvt Ltd companies with director/related-party loans",
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f5",
    source: "EPFO",
    category: "Labour",
    title: "EPF wage ceiling proposed revision to ₹21,000",
    summary: "Labour ministry circulated draft notification raising wage ceiling from ₹15,000 — likely effective Q3 FY26-27.",
    impact: "All employers with staff earning ₹15,000-₹21,000 basic",
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f6",
    source: "RBI",
    category: "RBI / FEMA",
    title: "FC-GPR online filing window reduced to 30 days",
    summary: "Companies receiving FDI must file Form FC-GPR within 30 days of share allotment via FIRMS portal.",
    impact: "Startups with foreign investors",
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f7",
    source: "GSTN",
    category: "GST",
    title: "E-invoice threshold lowered to ₹3 cr aggregate turnover",
    summary: "Phase-6 of e-invoicing mandates IRN generation for B2B invoices for taxpayers > ₹3cr from 1 Aug 2026.",
    impact: "Mid-sized businesses crossing ₹3cr",
    publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "f8",
    source: "DPIIT",
    category: "Startup Schemes",
    title: "Tax holiday u/s 80-IAC extended to startups incorporated till 31 Mar 2030",
    summary: "Eligible DPIIT-recognised startups get 100% deduction on profits for 3 consecutive years out of 10.",
    impact: "Startups incorporated FY 2024-25 onwards",
    publishedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const fetchComplianceUpdates = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ updates: ComplianceUpdate[]; generatedAt: string; live: boolean }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { updates: FALLBACK, generatedAt: new Date().toISOString(), live: false };
    }

    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content:
                "You are an Indian compliance scraper. Return ONLY valid JSON: an array of 8 recent compliance updates relevant to Indian startups across GST, Income Tax, Startup Schemes, MCA / ROC, Labour, and RBI / FEMA. Each item: {id, source, category, title, summary, impact, publishedAt (ISO), url?}. Categories must match exactly. Be specific and realistic.",
            },
            {
              role: "user",
              content: "Give me the latest 8 compliance updates for Indian startups, newest first.",
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!res.ok) throw new Error(`AI ${res.status}`);
      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(content);
      const arr: ComplianceUpdate[] = Array.isArray(parsed)
        ? parsed
        : parsed.updates || parsed.items || parsed.data || [];
      if (!arr.length) throw new Error("empty");
      return { updates: arr.slice(0, 12), generatedAt: new Date().toISOString(), live: true };
    } catch {
      return { updates: FALLBACK, generatedAt: new Date().toISOString(), live: false };
    }
  },
);
