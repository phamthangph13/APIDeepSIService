import type { PlanId } from "../data/plans";
import { api } from "./api";
import { mapUser, type User, type UserRole } from "./auth";
import { mapOrder, type OrderStatus, type PaymentOrder } from "./billing";
import { mapUsageSummary, type ApiUsageSummary, type UsageSummary } from "./usage";

type ApiUser = Parameters<typeof mapUser>[0];
type ApiOrder = Parameters<typeof mapOrder>[0];

export type AdminStats = {
  usersTotal: number;
  usersByPlan: Record<PlanId, number>;
  activeKeys: number;
  revenueMonth: number;
  tokens30d: number;
  requests30d: number;
  pendingOrders: number;
  generatedAt: string;
  currency: string;
};

export type AdminUserListItem = {
  user: User;
  keyCount: number;
  tokens30d: number;
  lastSeen: string;
};

export type AdminUsersPage = {
  items: AdminUserListItem[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminOrdersPage = {
  items: PaymentOrder[];
  total: number;
  limit: number;
  offset: number;
};

type ApiAdminStats = {
  users_total?: number;
  users_by_plan?: Record<string, number>;
  active_keys?: number;
  revenue_month?: number;
  tokens_30d?: number;
  requests_30d?: number;
  pending_orders?: number;
  generated_at?: string;
  currency?: string;
};

type ApiAdminUserListItem = {
  user: ApiUser;
  key_count?: number;
  tokens_30d?: number;
  last_seen: string;
};

type ApiAdminUsersPage = {
  items?: ApiAdminUserListItem[];
  total?: number;
  limit?: number;
  offset?: number;
};

type ApiAdminOrdersPage = {
  items?: ApiOrder[];
  total?: number;
  limit?: number;
  offset?: number;
};

export type AdminUsersQuery = {
  q?: string;
  role?: UserRole | "";
  plan?: PlanId | "";
  limit?: number;
  offset?: number;
};

export type AdminOrdersQuery = {
  status?: OrderStatus | "";
  limit?: number;
  offset?: number;
};

const PLAN_IDS: PlanId[] = ["free", "plus", "ultral"];

export async function fetchAdminStats(): Promise<AdminStats> {
  const raw = await api.get<ApiAdminStats>("/admin/stats");
  const usersByPlan: Record<PlanId, number> = { free: 0, plus: 0, ultral: 0 };
  for (const id of PLAN_IDS) {
    usersByPlan[id] = raw.users_by_plan?.[id] ?? 0;
  }
  return {
    usersTotal: raw.users_total ?? 0,
    usersByPlan,
    activeKeys: raw.active_keys ?? 0,
    revenueMonth: raw.revenue_month ?? 0,
    tokens30d: raw.tokens_30d ?? 0,
    requests30d: raw.requests_30d ?? 0,
    pendingOrders: raw.pending_orders ?? 0,
    generatedAt: raw.generated_at ?? new Date().toISOString(),
    currency: raw.currency ?? "VND",
  };
}

export async function listAdminUsers(query: AdminUsersQuery = {}): Promise<AdminUsersPage> {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.role) params.set("role", query.role);
  if (query.plan) params.set("plan", query.plan);
  params.set("limit", String(query.limit ?? 20));
  params.set("offset", String(query.offset ?? 0));

  const raw = await api.get<ApiAdminUsersPage>(`/admin/users?${params.toString()}`);
  return {
    items: (raw.items ?? []).map((item) => ({
      user: mapUser(item.user),
      keyCount: item.key_count ?? 0,
      tokens30d: item.tokens_30d ?? 0,
      lastSeen: item.last_seen,
    })),
    total: raw.total ?? 0,
    limit: raw.limit ?? (query.limit ?? 20),
    offset: raw.offset ?? (query.offset ?? 0),
  };
}

export async function updateAdminUserRole(userId: string, role: UserRole): Promise<User> {
  return mapUser(
    await api.patch<ApiUser>(`/admin/users/${encodeURIComponent(userId)}/role`, { role }),
  );
}

export async function updateAdminUserPlan(
  userId: string,
  planId: PlanId,
  months = 1,
): Promise<User> {
  return mapUser(
    await api.patch<ApiUser>(`/admin/users/${encodeURIComponent(userId)}/plan`, {
      plan_id: planId,
      months,
    }),
  );
}

export async function listAdminOrders(query: AdminOrdersQuery = {}): Promise<AdminOrdersPage> {
  const params = new URLSearchParams();
  if (query.status) params.set("status", query.status);
  params.set("limit", String(query.limit ?? 20));
  params.set("offset", String(query.offset ?? 0));

  const raw = await api.get<ApiAdminOrdersPage>(`/admin/orders?${params.toString()}`);
  return {
    items: (raw.items ?? []).map(mapOrder),
    total: raw.total ?? 0,
    limit: raw.limit ?? (query.limit ?? 20),
    offset: raw.offset ?? (query.offset ?? 0),
  };
}

export async function fetchAdminUsage(days: 7 | 30 | 90): Promise<UsageSummary> {
  const raw = await api.get<ApiUsageSummary>(`/admin/usage?days=${days}`);
  return mapUsageSummary(raw);
}
