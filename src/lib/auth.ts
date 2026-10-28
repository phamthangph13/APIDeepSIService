import type { PlanId } from "../data/plans";
import { api, clearAccessToken, errorMessage, setAccessToken } from "./api";

export type Provider = "password" | "google" | "github";
export type UserRole = "client" | "admin";
export type AvatarColor = "moss" | "clay" | "ochre" | "blue" | "lavender";
export type KeyEnvironment = "production" | "development";
export type KeyStatus = "active" | "revoked";

export type User = {
  id: string;
  name: string;
  email: string;
  provider: Provider;
  role: UserRole;
  plan: PlanId;
  planStartedAt: string | null;
  planExpiresAt: string | null;
  cancelAtPeriodEnd: boolean;
  emailVerified: boolean;
  avatarColor: AvatarColor;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

export type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  environment: KeyEnvironment;
  scopes: string[];
  expiresAt: string | null;
  lastUsedAt: string | null;
  status: KeyStatus;
  createdAt: string;
  revokedAt: string | null;
  /** Only present in the create response. */
  key?: string;
};

export type ApiKeyInput = {
  name: string;
  environment: KeyEnvironment;
  scopes: string[];
  expiresInDays: number | null;
};

export type AuthSession = {
  user?: User;
  accessToken?: string;
  requiresEmailVerification?: boolean;
  message?: string;
};

export type AuthOutcome = AuthSession & {
  error?: string;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  provider: string;
  role: string;
  plan: string;
  plan_started_at?: string | null;
  plan_expires_at?: string | null;
  cancel_at_period_end?: boolean;
  email_verified?: boolean;
  avatar_color?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
};

type ApiAuthResult = {
  user?: ApiUser;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  requires_email_verification?: boolean;
  message?: string;
};

type ApiApiKey = {
  id: string;
  name: string;
  prefix: string;
  last4: string;
  environment: string;
  scopes?: string[];
  expires_at?: string | null;
  last_used_at?: string | null;
  status: string;
  created_at: string;
  revoked_at?: string | null;
  key?: string;
};

const PLAN_IDS: PlanId[] = ["free", "plus", "ultral"];
const AVATAR_COLORS: AvatarColor[] = ["moss", "clay", "ochre", "blue", "lavender"];

function normalizePlan(value: string): PlanId {
  return PLAN_IDS.includes(value as PlanId) ? (value as PlanId) : "free";
}

function normalizeAvatar(value: string | undefined): AvatarColor {
  return AVATAR_COLORS.includes(value as AvatarColor) ? (value as AvatarColor) : "moss";
}

export function mapUser(raw: ApiUser): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    provider: (raw.provider === "google" || raw.provider === "github" ? raw.provider : "password"),
    role: raw.role === "admin" ? "admin" : "client",
    plan: normalizePlan(raw.plan),
    planStartedAt: raw.plan_started_at ?? null,
    planExpiresAt: raw.plan_expires_at ?? null,
    cancelAtPeriodEnd: Boolean(raw.cancel_at_period_end),
    emailVerified: Boolean(raw.email_verified),
    avatarColor: normalizeAvatar(raw.avatar_color),
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    lastLoginAt: raw.last_login_at ?? null,
  };
}

function mapApiKey(raw: ApiApiKey): ApiKey {
  return {
    id: raw.id,
    name: raw.name,
    prefix: raw.prefix,
    last4: raw.last4,
    environment: raw.environment === "development" ? "development" : "production",
    scopes: raw.scopes ?? [],
    expiresAt: raw.expires_at ?? null,
    lastUsedAt: raw.last_used_at ?? null,
    status: raw.status === "revoked" ? "revoked" : "active",
    createdAt: raw.created_at,
    revokedAt: raw.revoked_at ?? null,
    key: raw.key,
  };
}

function toSession(data: ApiAuthResult): AuthSession {
  if (data.access_token) setAccessToken(data.access_token);
  return {
    user: data.user ? mapUser(data.user) : undefined,
    accessToken: data.access_token,
    requiresEmailVerification: Boolean(data.requires_email_verification),
    message: data.message,
  };
}

export async function fetchMe(): Promise<User> {
  return mapUser(await api.get<ApiUser>("/auth/me"));
}

export async function loginWithPassword(email: string, password: string): Promise<AuthOutcome> {
  try {
    const data = await api.post<ApiAuthResult>("/auth/login", { email, password });
    return toSession(data);
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function registerWithPassword(
  name: string,
  email: string,
  password: string,
): Promise<AuthOutcome> {
  try {
    const data = await api.post<ApiAuthResult>("/auth/register", { name, email, password });
    return toSession(data);
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post<void>("/auth/logout");
  } catch {
    // The local session is cleared even if the server is unreachable.
  } finally {
    clearAccessToken();
  }
}

export async function exchangeOAuthCode(code: string): Promise<AuthOutcome> {
  try {
    const data = await api.post<ApiAuthResult>("/auth/oauth/exchange", { code });
    return toSession(data);
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export type PasswordResetRequest = {
  message?: string;
  debugToken?: string;
  resetUrl?: string;
  error?: string;
};

export async function requestPasswordReset(email: string): Promise<PasswordResetRequest> {
  try {
    const data = await api.post<{
      message?: string;
      debug_token?: string;
      reset_url?: string;
    }>("/auth/forgot-password", { email });
    return {
      message: data.message,
      debugToken: data.debug_token,
      resetUrl: data.reset_url,
    };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function resetPassword(token: string, password: string): Promise<AuthOutcome> {
  try {
    const data = await api.post<ApiAuthResult>("/auth/reset-password", { token, password });
    return toSession(data);
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function verifyEmail(token: string): Promise<{ message?: string; error?: string }> {
  try {
    const data = await api.post<{ message?: string }>("/auth/verify-email", { token });
    return { message: data.message };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function resendVerification(email: string): Promise<{ message?: string; error?: string }> {
  try {
    const data = await api.post<{ message?: string }>("/auth/resend-verification", { email });
    return { message: data.message };
  } catch (error) {
    return { error: errorMessage(error) };
  }
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const keys = await api.get<ApiApiKey[]>("/api-keys");
  return keys.map(mapApiKey);
}

export async function createApiKey(input: ApiKeyInput): Promise<ApiKey> {
  const key = await api.post<ApiApiKey>("/api-keys", {
    name: input.name.trim(),
    environment: input.environment,
    scopes: input.scopes,
    expires_in_days: input.expiresInDays ?? 0,
  });
  return mapApiKey(key);
}

export async function revokeApiKey(keyId: string): Promise<void> {
  await api.delete<void>(`/api-keys/${encodeURIComponent(keyId)}`);
}
