import { getServiceById } from "./catalog";
import type {
  FounderOrder,
  OrderStatus,
  OrdersState,
  PlaceOrderInput,
} from "./types";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PROGRESS,
} from "./types";

const STORAGE_KEY = "complyos-founder-orders";

function emptyState(): OrdersState {
  return { orders: [], nextSeq: 2400 };
}

function loadRaw(): OrdersState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as OrdersState;
    if (!Array.isArray(parsed.orders)) return emptyState();
    return {
      orders: parsed.orders,
      nextSeq: parsed.nextSeq ?? 2400,
    };
  } catch {
    return emptyState();
  }
}

function persist(state: OrdersState): OrdersState {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("founder-orders-update"));
  }
  return state;
}

export function loadOrdersState(): OrdersState {
  return loadRaw();
}

export function loadOrders(): FounderOrder[] {
  return loadRaw().orders.sort(
    (a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()
  );
}

export function getOrderById(id: string): FounderOrder | undefined {
  return loadOrders().find((o) => o.id === id);
}

function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return d;
}

function computeDueDate(tatDays: number | null): string | null {
  if (tatDays == null || tatDays <= 0) return null;
  return addBusinessDays(new Date(), tatDays).toISOString();
}

function pickPartner(serviceId: string, partners: string[], seq: number): string {
  if (!partners.length) return "ComplyOS Partner Desk";
  const hash = (serviceId + seq).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return partners[hash % partners.length];
}

function computePrice(
  billingType: "monthly" | "one_time" | "per_employee",
  baseAmount: number,
  employeeCount?: number
): { amount: number; display: string } {
  if (billingType === "per_employee") {
    const count = Math.max(1, employeeCount ?? 1);
    const amount = baseAmount * count;
    return {
      amount,
      display: `₹ ${amount.toLocaleString("en-IN")} (${count} employees × ₹ ${baseAmount})`,
    };
  }
  if (billingType === "monthly") {
    return { amount: baseAmount, display: `₹ ${baseAmount.toLocaleString("en-IN")}/mo` };
  }
  return { amount: baseAmount, display: `₹ ${baseAmount.toLocaleString("en-IN")}` };
}

export function placeOrder(input: PlaceOrderInput): FounderOrder | null {
  const service = getServiceById(input.serviceId);
  if (!service) return null;

  const state = loadRaw();
  const seq = state.nextSeq + 1;
  const id = `FMB-${seq}`;
  const now = new Date().toISOString();
  const partner = pickPartner(service.id, service.partners, seq);
  const pricing = computePrice(service.billingType, service.priceAmount, input.employeeCount);
  const initialStatus: OrderStatus = "awaiting_docs";

  const order: FounderOrder = {
    id,
    serviceId: service.id,
    serviceName: service.name,
    category: service.category,
    partner,
    status: initialStatus,
    stage: ORDER_STATUS_LABELS[initialStatus],
    progress: ORDER_STATUS_PROGRESS[initialStatus],
    priceAmount: pricing.amount,
    priceDisplay: pricing.display,
    billingType: service.billingType,
    employeeCount: input.employeeCount,
    dueDate: computeDueDate(service.tatDays),
    placedAt: now,
    updatedAt: now,
    companyName: input.companyName.trim(),
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim(),
    contactPhone: input.contactPhone.trim(),
    periodLabel: input.periodLabel?.trim() || undefined,
    notes: input.notes?.trim() || undefined,
    tat: service.tat,
    timeline: [
      {
        at: now,
        label: "Order placed",
        detail: `Assigned to ${partner}. Upload documents to begin.`,
      },
      {
        at: now,
        label: "Awaiting your documents",
        detail: service.documentsNeeded.slice(0, 2).join(", ") + "…",
      },
    ],
  };

  persist({
    orders: [order, ...state.orders],
    nextSeq: seq,
  });

  return order;
}

export function updateOrderStatus(id: string, status: OrderStatus): FounderOrder | null {
  const state = loadRaw();
  const idx = state.orders.findIndex((o) => o.id === id);
  if (idx < 0) return null;

  const now = new Date().toISOString();
  const prev = state.orders[idx];
  const updated: FounderOrder = {
    ...prev,
    status,
    stage: ORDER_STATUS_LABELS[status],
    progress: ORDER_STATUS_PROGRESS[status],
    updatedAt: now,
    timeline: [
      { at: now, label: ORDER_STATUS_LABELS[status] },
      ...prev.timeline,
    ],
  };

  const orders = [...state.orders];
  orders[idx] = updated;
  persist({ ...state, orders });
  return updated;
}

export function getOrderStats(orders: FounderOrder[]) {
  const active = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const awaiting = orders.filter((o) => o.status === "awaiting_docs" || o.status === "placed");
  const completedYtd = orders.filter((o) => {
    if (o.status !== "completed" && o.status !== "filed") return false;
    return new Date(o.placedAt).getFullYear() === new Date().getFullYear();
  });
  const spentYtd = orders
    .filter((o) => new Date(o.placedAt).getFullYear() === new Date().getFullYear())
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.priceAmount, 0);

  return {
    inProgress: active.length,
    awaitingInput: awaiting.length,
    completedYtd: completedYtd.length,
    spentYtd,
  };
}

export function getActiveOrderCount(): number {
  return loadOrders().filter((o) => o.status !== "completed" && o.status !== "cancelled").length;
}
