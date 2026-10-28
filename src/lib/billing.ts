import type { Plan } from "../data/plans";
import { api } from "./api";
import { mapApiPlan, type ApiPlan } from "./plans";
import { mapUsageSummary, type ApiUsageSummary, type UsageSummary } from "./usage";

export type PaymentMode = "gateway" | "bank_transfer" | "mock" | "none";
export type OrderStatus = "pending" | "paid" | "expired" | "cancelled" | "failed";

export type PaymentOrder = {
  id: string;
  planId: string;
  amountVnd: number;
  currency: string;
  invoiceNumber: string;
  paymentCode: string;
  status: OrderStatus;
  provider: string;
  providerTransaction?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  paidAt: string | null;
};

export type BankTransfer = {
  bankCode: string;
  bankName?: string;
  accountNumber: string;
  accountHolder: string;
  amountVnd: number;
  content: string;
  qrUrl: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  planId: string;
  planName: string;
  amountVnd: number;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
};

export type BillingOverview = {
  plan: Plan;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  usage: UsageSummary;
  invoices: Invoice[];
  pendingOrder: PaymentOrder | null;
  paymentConfigured: boolean;
  paymentMode: PaymentMode;
  bankTransfer: BankTransfer | null;
};

export type PaymentCheckout = {
  order: PaymentOrder;
  mode: PaymentMode;
  action?: string;
  method?: string;
  fields?: Record<string, string>;
  bankTransfer?: BankTransfer;
  mock?: boolean;
};

type ApiOrder = {
  id: string;
  plan_id: string;
  amount_vnd: number;
  currency: string;
  invoice_number: string;
  payment_code: string;
  status: string;
  provider: string;
  provider_transaction?: string;
  description: string;
  created_at: string;
  updated_at: string;
  expires_at: string;
  paid_at?: string | null;
};

type ApiBankTransfer = {
  bank_code: string;
  bank_name?: string;
  account_number: string;
  account_holder: string;
  amount_vnd: number;
  content: string;
  qr_url: string;
};

type ApiInvoice = {
  id: string;
  invoice_number: string;
  plan_id: string;
  plan_name: string;
  amount_vnd: number;
  status: string;
  created_at: string;
  paid_at?: string | null;
};

type ApiBillingOverview = {
  plan: ApiPlan;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
  cancel_at_period_end?: boolean;
  usage: ApiUsageSummary;
  invoices?: ApiInvoice[];
  pending_order?: ApiOrder | null;
  payment_configured?: boolean;
  payment_mode?: string;
  bank_transfer?: ApiBankTransfer | null;
};

type ApiCheckout = {
  order: ApiOrder;
  mode: string;
  action?: string;
  method?: string;
  fields?: Record<string, string>;
  bank_transfer?: ApiBankTransfer;
  mock?: boolean;
};

function mapStatus(value: string): OrderStatus {
  if (value === "paid" || value === "expired" || value === "cancelled" || value === "failed") {
    return value;
  }
  return "pending";
}

function mapMode(value: string | undefined): PaymentMode {
  if (value === "gateway" || value === "bank_transfer" || value === "mock") return value;
  return "none";
}

export function mapOrder(raw: ApiOrder): PaymentOrder {
  return {
    id: raw.id,
    planId: raw.plan_id,
    amountVnd: raw.amount_vnd,
    currency: raw.currency,
    invoiceNumber: raw.invoice_number,
    paymentCode: raw.payment_code,
    status: mapStatus(raw.status),
    provider: raw.provider,
    providerTransaction: raw.provider_transaction,
    description: raw.description,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    expiresAt: raw.expires_at,
    paidAt: raw.paid_at ?? null,
  };
}

function mapBankTransfer(raw: ApiBankTransfer): BankTransfer {
  return {
    bankCode: raw.bank_code,
    bankName: raw.bank_name,
    accountNumber: raw.account_number,
    accountHolder: raw.account_holder,
    amountVnd: raw.amount_vnd,
    content: raw.content,
    qrUrl: raw.qr_url,
  };
}

function mapInvoice(raw: ApiInvoice): Invoice {
  return {
    id: raw.id,
    invoiceNumber: raw.invoice_number,
    planId: raw.plan_id,
    planName: raw.plan_name,
    amountVnd: raw.amount_vnd,
    status: mapStatus(raw.status),
    createdAt: raw.created_at,
    paidAt: raw.paid_at ?? null,
  };
}

function mapCheckout(raw: ApiCheckout): PaymentCheckout {
  return {
    order: mapOrder(raw.order),
    mode: mapMode(raw.mode),
    action: raw.action,
    method: raw.method,
    fields: raw.fields,
    bankTransfer: raw.bank_transfer ? mapBankTransfer(raw.bank_transfer) : undefined,
    mock: raw.mock,
  };
}

export async function fetchBillingOverview(): Promise<BillingOverview> {
  const raw = await api.get<ApiBillingOverview>("/billing");
  return {
    plan: mapApiPlan(raw.plan),
    planStartedAt: raw.plan_started_at ?? null,
    planExpiresAt: raw.plan_expires_at ?? null,
    cancelAtPeriodEnd: Boolean(raw.cancel_at_period_end),
    usage: mapUsageSummary(raw.usage),
    invoices: (raw.invoices ?? []).map(mapInvoice),
    pendingOrder: raw.pending_order ? mapOrder(raw.pending_order) : null,
    paymentConfigured: Boolean(raw.payment_configured),
    paymentMode: mapMode(raw.payment_mode),
    bankTransfer: raw.bank_transfer ? mapBankTransfer(raw.bank_transfer) : null,
  };
}

export async function createCheckout(planId: string): Promise<PaymentCheckout> {
  return mapCheckout(await api.post<ApiCheckout>("/billing/checkout", { plan_id: planId }));
}

export async function fetchOrder(orderId: string): Promise<PaymentOrder> {
  return mapOrder(await api.get<ApiOrder>(`/billing/orders/${encodeURIComponent(orderId)}`));
}

export async function completeMockPayment(orderId: string): Promise<PaymentOrder> {
  return mapOrder(
    await api.post<ApiOrder>(`/billing/orders/${encodeURIComponent(orderId)}/mock-complete`),
  );
}

export async function cancelRenewal(): Promise<void> {
  await api.post("/billing/cancel");
}

export async function downgradeToFree(): Promise<void> {
  await api.post("/billing/downgrade");
}
