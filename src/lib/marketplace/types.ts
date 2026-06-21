export type OrderStatus =
  | "placed"
  | "awaiting_docs"
  | "in_progress"
  | "review"
  | "filed"
  | "completed"
  | "cancelled";

export type OrderTimelineEvent = {
  at: string;
  label: string;
  detail?: string;
};

export type PlaceOrderInput = {
  serviceId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  periodLabel?: string;
  employeeCount?: number;
  notes?: string;
};

export type FounderOrder = {
  id: string;
  serviceId: string;
  serviceName: string;
  category: string;
  partner: string;
  status: OrderStatus;
  stage: string;
  progress: number;
  priceAmount: number;
  priceDisplay: string;
  billingType: "monthly" | "one_time" | "per_employee";
  employeeCount?: number;
  dueDate: string | null;
  placedAt: string;
  updatedAt: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  periodLabel?: string;
  notes?: string;
  tat: string;
  timeline: OrderTimelineEvent[];
};

export type OrdersState = {
  orders: FounderOrder[];
  nextSeq: number;
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order placed",
  awaiting_docs: "Awaiting documents",
  in_progress: "In progress",
  review: "Under review",
  filed: "Filed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_PROGRESS: Record<OrderStatus, number> = {
  placed: 10,
  awaiting_docs: 20,
  in_progress: 55,
  review: 75,
  filed: 90,
  completed: 100,
  cancelled: 0,
};

export function orderStatusTone(
  status: OrderStatus
): "done" | "pend" | "miss" | "infra" | "n" {
  if (status === "completed" || status === "filed") return "done";
  if (status === "awaiting_docs" || status === "placed") return "pend";
  if (status === "cancelled") return "miss";
  if (status === "review") return "infra";
  return "pend";
}

export function isActiveOrder(status: OrderStatus): boolean {
  return status !== "completed" && status !== "cancelled";
}

export function needsFounderAction(status: OrderStatus): boolean {
  return status === "awaiting_docs" || status === "placed";
}
