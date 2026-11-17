type RazorpayPlan = { id: string };
type RazorpaySubscription = {
  id: string;
  status?: string;
  short_url?: string;
  charge_at?: number | null;
  created_at?: number;
  ended_at?: number | null;
  has_scheduled_changes?: boolean;
};

export class RazorpayApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function razorpayRequest<T>(path: string, body?: unknown): Promise<T> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new RazorpayApiError("Razorpay is not configured.", 503);

  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = result?.error?.description || result?.error?.reason || "Razorpay could not complete the request.";
    throw new RazorpayApiError(String(message).slice(0, 300), response.status);
  }
  return result as T;
}

export function createRazorpayPlan(input: {
  name: string;
  description: string;
  amountPaise: number;
  localPlanId: string;
}) {
  return razorpayRequest<RazorpayPlan>("/plans", {
    period: "monthly",
    interval: 1,
    item: {
      name: input.name,
      description: input.description || `Monthly donation to Shri Nityanikunj Trust: ${input.name}`,
      amount: input.amountPaise,
      currency: "INR",
    },
    notes: { local_plan_id: input.localPlanId },
  });
}

export function createRazorpaySubscription(input: {
  gatewayPlanId: string;
  totalCycles: number;
  localSubscriptionId: string;
}) {
  return razorpayRequest<RazorpaySubscription>("/subscriptions", {
    plan_id: input.gatewayPlanId,
    total_count: input.totalCycles,
    quantity: 1,
    customer_notify: true,
    notes: { local_subscription_id: input.localSubscriptionId },
  });
}

export function cancelRazorpaySubscription(id: string, atCycleEnd = true) {
  return razorpayRequest<RazorpaySubscription>(`/subscriptions/${encodeURIComponent(id)}/cancel`, {
    cancel_at_cycle_end: atCycleEnd,
  });
}

export function mapRazorpaySubscriptionStatus(status: unknown): string {
  switch (status) {
    case "created": return "CREATED";
    case "authenticated": return "AUTHENTICATED";
    case "active":
    case "resumed": return "ACTIVE";
    case "pending": return "PENDING";
    case "halted": return "HALTED";
    case "paused": return "PAUSED";
    case "cancelled": return "CANCELLED";
    case "completed": return "COMPLETED";
    case "expired": return "EXPIRED";
    default: return "PENDING";
  }
}

export function fromUnixSeconds(value: unknown): Date | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? new Date(value * 1000)
    : null;
}
