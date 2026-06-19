// Rule-based compliance engine.
// Pure functions — no DB access. Used by server fns to generate tasks.

export type CompanyProfile = {
  entity_type?: string | null;
  state?: string | null;
  gstin?: string | null;
  pan?: string | null;
  cin?: string | null;
  headcount?: number | null;
  turnover_band?: string | null;
  registrations?: Record<string, boolean> | null;
};

export type GeneratedTask = {
  rule_code: string;
  title: string;
  description: string;
  category: "GST" | "Income Tax" | "Labour" | "MCA" | "RBI";
  authority: string;
  period: string;
  due_date: string; // ISO date
  penalty_info?: string;
};

function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}
function monthLabel(d: Date) {
  return d.toLocaleString("en-IN", { month: "short", year: "numeric" });
}
function quarterLabel(d: Date) {
  const m = d.getMonth();
  const q = Math.floor(m / 3) + 1;
  return `Q${q} ${d.getFullYear()}`;
}
function fyLabel(d: Date) {
  // Indian FY: Apr-Mar
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `FY ${y}-${String((y + 1) % 100).padStart(2, "0")}`;
}

/**
 * Generate compliance tasks for the next `months` months (default 6)
 * starting from `from` (default today).
 */
export function generateTasks(
  profile: CompanyProfile,
  from: Date = new Date(),
  months = 6
): GeneratedTask[] {
  const tasks: GeneratedTask[] = [];
  const hasGst = !!profile.gstin;
  const hasPf = !!profile.registrations?.pf;
  const hasEsi = !!profile.registrations?.esi;
  const hasPt = !!profile.registrations?.pt;
  const isCompany = ["private_limited", "opc", "public_limited"].includes(profile.entity_type || "");
  const isLlp = profile.entity_type === "llp";
  const turnoverBand = profile.turnover_band || "";
  const isQrmpEligible = ["<40L", "40L-1.5Cr"].includes(turnoverBand); // <5Cr aggregate

  // walk months
  for (let i = 0; i < months; i++) {
    const m = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const next = new Date(m.getFullYear(), m.getMonth() + 1, 1);
    const period = monthLabel(m);

    // ---- GST ----
    if (hasGst) {
      // GSTR-1: 11th of next month (monthly) or 13th (QRMP)
      if (!isQrmpEligible || m.getMonth() % 3 === 2) {
        const due = isQrmpEligible
          ? new Date(next.getFullYear(), next.getMonth(), 13)
          : new Date(next.getFullYear(), next.getMonth(), 11);
        tasks.push({
          rule_code: "GSTR-1",
          title: `GSTR-1 filing · ${period}`,
          description: "Outward supplies / sales return.",
          category: "GST",
          authority: "CBIC",
          period,
          due_date: ymd(due),
          penalty_info: "Late fee ₹50/day (₹20/day for nil return), max ₹5,000.",
        });
      }

      // GSTR-3B: 20th of next month (monthly) or 22/24 (QRMP based on state)
      const due3b = isQrmpEligible
        ? new Date(next.getFullYear(), next.getMonth(), 22)
        : new Date(next.getFullYear(), next.getMonth(), 20);
      if (!isQrmpEligible || m.getMonth() % 3 === 2) {
        tasks.push({
          rule_code: "GSTR-3B",
          title: `GSTR-3B summary return · ${period}`,
          description: "Self-declared summary of GST liability and ITC.",
          category: "GST",
          authority: "CBIC",
          period,
          due_date: ymd(due3b),
          penalty_info: "Late fee ₹50/day + interest @18% p.a. on tax liability.",
        });
      }
    }

    // ---- TDS (assume deductor — most companies) ----
    if (isCompany || isLlp) {
      // Monthly TDS payment: 7th of next month
      const tdsPay = new Date(next.getFullYear(), next.getMonth(), 7);
      tasks.push({
        rule_code: "TDS-PAY",
        title: `TDS payment · ${period}`,
        description: "Deposit TDS deducted during the month (Challan ITNS-281).",
        category: "Income Tax",
        authority: "CBDT",
        period,
        due_date: ymd(tdsPay),
        penalty_info: "Interest 1.5% per month + late filing fee ₹200/day.",
      });

      // Quarterly TDS return (26Q/24Q): 31st of month after quarter end (Q4 → 31 May)
      if (m.getMonth() === 5 || m.getMonth() === 8 || m.getMonth() === 11 || m.getMonth() === 2) {
        const qEnd = new Date(m.getFullYear(), m.getMonth() + 1, 0);
        const ret = m.getMonth() === 2
          ? new Date(m.getFullYear(), 4, 31) // Q4 ends Mar → due 31 May
          : new Date(qEnd.getFullYear(), qEnd.getMonth() + 1, 31);
        tasks.push({
          rule_code: "TDS-24Q-26Q",
          title: `TDS quarterly return (24Q + 26Q) · ${quarterLabel(m)}`,
          description: "Quarterly statement of tax deducted at source for salaries (24Q) and non-salaries (26Q).",
          category: "Income Tax",
          authority: "CBDT",
          period: quarterLabel(m),
          due_date: ymd(ret),
          penalty_info: "Late fee ₹200/day under sec 234E + penalty ₹10k–1L under sec 271H.",
        });
      }
    }

    // ---- PF ECR ----
    if (hasPf && (profile.headcount ?? 0) >= 20) {
      const due = new Date(next.getFullYear(), next.getMonth(), 15);
      tasks.push({
        rule_code: "PF-ECR",
        title: `PF Electronic Challan-cum-Return · ${period}`,
        description: "Upload ECR and remit PF contributions for the month.",
        category: "Labour",
        authority: "EPFO",
        period,
        due_date: ymd(due),
        penalty_info: "Damages 5–25% p.a. + interest 12% p.a. on late deposits.",
      });
    }

    // ---- ESI ----
    if (hasEsi && (profile.headcount ?? 0) >= 10) {
      const due = new Date(next.getFullYear(), next.getMonth(), 15);
      tasks.push({
        rule_code: "ESI",
        title: `ESI contribution · ${period}`,
        description: "Remit employer + employee ESI contributions.",
        category: "Labour",
        authority: "ESIC",
        period,
        due_date: ymd(due),
        penalty_info: "Interest 12% p.a. + damages up to 25%.",
      });
    }

    // ---- Professional Tax (state-dependent; we surface generic monthly) ----
    if (hasPt) {
      const due = new Date(next.getFullYear(), next.getMonth(), 10);
      tasks.push({
        rule_code: "PT-MONTHLY",
        title: `Professional Tax · ${period}`,
        description: `Deposit professional tax deducted from employees${profile.state ? ` (${profile.state})` : ""}.`,
        category: "Labour",
        authority: "State Govt",
        period,
        due_date: ymd(due),
        penalty_info: "Penalty per state PT Act (typically 10–50% of tax + interest).",
      });
    }
  }

  // ---- Annual filings (next 12 months) ----
  const today = from;
  const fy = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  const fyEnd = new Date(fy + 1, 2, 31); // 31 Mar

  if (isCompany) {
    tasks.push({
      rule_code: "ROC-AOC-4",
      title: `MCA AOC-4 (Financial statements) · ${fyLabel(fyEnd)}`,
      description: "File audited financials with the Registrar of Companies.",
      category: "MCA",
      authority: "MCA",
      period: fyLabel(fyEnd),
      due_date: ymd(new Date(fy + 1, 9, 30)), // 30 Oct
      penalty_info: "Additional fee ₹100/day, no upper limit.",
    });
    tasks.push({
      rule_code: "ROC-MGT-7",
      title: `MCA MGT-7 (Annual return) · ${fyLabel(fyEnd)}`,
      description: "File annual return with the Registrar of Companies.",
      category: "MCA",
      authority: "MCA",
      period: fyLabel(fyEnd),
      due_date: ymd(new Date(fy + 1, 10, 29)), // 29 Nov (60 days from AGM)
      penalty_info: "Additional fee ₹100/day, no upper limit.",
    });
    tasks.push({
      rule_code: "ROC-DPT-3",
      title: `MCA DPT-3 (Return of deposits) · ${fyLabel(fyEnd)}`,
      description: "Annual return of deposits / loans outstanding.",
      category: "MCA",
      authority: "MCA",
      period: fyLabel(fyEnd),
      due_date: ymd(new Date(fy + 1, 5, 30)), // 30 Jun
    });
  }
  if (isLlp) {
    tasks.push({
      rule_code: "LLP-FORM-11",
      title: `LLP Form 11 (Annual return) · ${fyLabel(fyEnd)}`,
      description: "Annual return for LLPs.",
      category: "MCA",
      authority: "MCA",
      period: fyLabel(fyEnd),
      due_date: ymd(new Date(fy + 1, 4, 30)), // 30 May
      penalty_info: "Additional fee ₹100/day.",
    });
    tasks.push({
      rule_code: "LLP-FORM-8",
      title: `LLP Form 8 (Statement of accounts) · ${fyLabel(fyEnd)}`,
      description: "Statement of accounts & solvency.",
      category: "MCA",
      authority: "MCA",
      period: fyLabel(fyEnd),
      due_date: ymd(new Date(fy + 1, 9, 30)), // 30 Oct
    });
  }

  // ITR
  tasks.push({
    rule_code: "ITR",
    title: `Income Tax Return · ${fyLabel(fyEnd)}`,
    description: isCompany || isLlp
      ? "Corporate ITR (audit cases due 31 Oct; non-audit 31 Jul)."
      : "Income Tax Return filing.",
    category: "Income Tax",
    authority: "CBDT",
    period: fyLabel(fyEnd),
    due_date: ymd(new Date(fy + 1, 9, 31)), // 31 Oct (audit cases)
    penalty_info: "Late fee up to ₹10,000 under sec 234F + interest under sec 234A/B/C.",
  });

  // Advance tax (4 instalments)
  const advanceDates = [
    new Date(fy, 5, 15), // 15 Jun
    new Date(fy, 8, 15), // 15 Sep
    new Date(fy, 11, 15), // 15 Dec
    new Date(fy + 1, 2, 15), // 15 Mar
  ];
  advanceDates.forEach((d, idx) => {
    tasks.push({
      rule_code: `ADVANCE-TAX-${idx + 1}`,
      title: `Advance Tax instalment ${idx + 1} · ${fyLabel(fyEnd)}`,
      description: `${[15, 45, 75, 100][idx]}% of estimated annual tax liability.`,
      category: "Income Tax",
      authority: "CBDT",
      period: fyLabel(fyEnd),
      due_date: ymd(d),
      penalty_info: "Interest under sec 234B/234C @ 1% per month on shortfall.",
    });
  });

  // Filter to tasks within range [from, from + months months + 12mo annual window]
  const horizonEnd = new Date(from.getFullYear() + 1, from.getMonth(), from.getDate());
  return tasks.filter((t) => {
    const d = new Date(t.due_date);
    return d >= new Date(from.getFullYear(), from.getMonth(), from.getDate() - 1) && d <= horizonEnd;
  });
}
