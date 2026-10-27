import type { PlanId } from "../data/plans";
import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from "./storage";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  provider: "password" | "google" | "github";
  plan: PlanId;
  createdAt: string;
  avatarColor: "moss" | "clay" | "ochre" | "blue" | "lavender";
};

export type Session = {
  userId: string;
  token: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  userId: string;
  name: string;
  key: string;
  prefix: string;
  environment: "production" | "development";
  scopes: string[];
  createdAt: string;
  lastUsed: string | null;
  status: "active" | "revoked";
};

export type ResetToken = {
  token: string;
  email: string;
  expiresAt: number;
  used: boolean;
};

export type ApiKeyInput = {
  name: string;
  environment: "production" | "development";
  scopes: string[];
  expiresInDays: number | null;
};

const DEMO_ID = "usr_demo_minh_anh";
const DEMO_EMAIL = "demo@deepsi.space";
const DEMO_PASSWORD_HASH =
  "c72882d27194dcc6d8b27fd780442d4048e7f4ec7c240e412431e7da6dea9b6a";

const AVATAR_COLORS: User["avatarColor"][] = ["moss", "clay", "ochre", "blue", "lavender"];

function uid(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${hex}`;
}

function randomToken(length = 32): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateApiKey(environment: "production" | "development"): string {
  const prefix = environment === "production" ? "dsi_live" : "dsi_test";
  return `${prefix}_${randomToken(36)}`;
}

function getUsers(): User[] {
  return readJSON<User[]>(STORAGE_KEYS.users, []);
}

function saveUsers(users: User[]): void {
  writeJSON(STORAGE_KEYS.users, users);
}

function getKeys(): ApiKey[] {
  return readJSON<ApiKey[]>(STORAGE_KEYS.keys, []);
}

function saveKeys(keys: ApiKey[]): void {
  writeJSON(STORAGE_KEYS.keys, keys);
}

export function seedDemo(): void {
  if (readJSON<boolean>(STORAGE_KEYS.seeded, false)) return;
  const users = getUsers();
  if (!users.some((user) => user.id === DEMO_ID)) {
    const now = new Date();
    const created = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 96).toISOString();
    const demo: User = {
      id: DEMO_ID,
      name: "Minh Anh",
      email: DEMO_EMAIL,
      passwordHash: DEMO_PASSWORD_HASH,
      provider: "password",
      plan: "plus",
      createdAt: created,
      avatarColor: "moss",
    };
    users.push(demo);
    saveUsers(users);
  }

  const keys = getKeys();
  if (!keys.some((key) => key.userId === DEMO_ID)) {
    const now = Date.now();
    keys.push(
      {
        id: uid("key"),
        userId: DEMO_ID,
        name: "Production · Website",
        key: "dsi_live_7Hk2mQ9sV4xL8nR3pW6tY1cB5dF0gJ2aK9eS",
        prefix: "dsi_live_7Hk2",
        environment: "production",
        scopes: ["chat", "embeddings", "vision"],
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 74).toISOString(),
        lastUsed: new Date(now - 1000 * 60 * 26).toISOString(),
        status: "active",
      },
      {
        id: uid("key"),
        userId: DEMO_ID,
        name: "Local · Playground",
        key: "dsi_test_3Pz8rN5wC1yB7mK4tQ9vL2hD6sF0gX8aJ5eU",
        prefix: "dsi_test_3Pz8",
        environment: "development",
        scopes: ["chat"],
        createdAt: new Date(now - 1000 * 60 * 60 * 24 * 32).toISOString(),
        lastUsed: new Date(now - 1000 * 60 * 60 * 8).toISOString(),
        status: "active",
      },
    );
    saveKeys(keys);
  }
  writeJSON(STORAGE_KEYS.seeded, true);
}

export function getSessionUser(): User | null {
  const session = readJSON<Session | null>(STORAGE_KEYS.session, null);
  if (!session) return null;
  const user = getUsers().find((item) => item.id === session.userId);
  return user ?? null;
}

function createSession(userId: string): Session {
  const session: Session = {
    userId,
    token: randomToken(24),
    createdAt: new Date().toISOString(),
  };
  writeJSON(STORAGE_KEYS.session, session);
  return session;
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ user?: User; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const user = getUsers().find((item) => item.email.toLowerCase() === normalized);
  if (!user || !user.passwordHash) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }
  const hash = await hashPassword(password, normalized);
  if (hash !== user.passwordHash) {
    return { error: "Email hoặc mật khẩu không đúng." };
  }
  createSession(user.id);
  return { user };
}

export async function registerWithPassword(
  name: string,
  email: string,
  password: string,
): Promise<{ user?: User; error?: string }> {
  const normalized = email.trim().toLowerCase();
  const users = getUsers();
  if (users.some((item) => item.email.toLowerCase() === normalized)) {
    return { error: "Email này đã có tài khoản. Hãy đăng nhập hoặc đặt lại mật khẩu." };
  }
  const hash = await hashPassword(password, normalized);
  const user: User = {
    id: uid("usr"),
    name: name.trim(),
    email: normalized,
    passwordHash: hash,
    provider: "password",
    plan: "free",
    createdAt: new Date().toISOString(),
    avatarColor: AVATAR_COLORS[users.length % AVATAR_COLORS.length],
  };
  users.push(user);
  saveUsers(users);
  createSession(user.id);
  return { user };
}

export function loginWithOAuth(provider: "google" | "github"): User {
  const normalized = `demo.${provider}@deepsi.space`;
  const users = getUsers();
  let user = users.find((item) => item.email === normalized);
  if (!user) {
    user = {
      id: uid(`usr_${provider}`),
      name: provider === "google" ? "Google Demo" : "GitHub Demo",
      email: normalized,
      provider,
      plan: "free",
      createdAt: new Date().toISOString(),
      avatarColor: provider === "google" ? "blue" : "clay",
    };
    users.push(user);
    saveUsers(users);
  }
  createSession(user.id);
  return user;
}

export function logout(): void {
  removeKey(STORAGE_KEYS.session);
}

export function updatePlan(userId: string, plan: PlanId): User | null {
  const users = getUsers();
  const index = users.findIndex((item) => item.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], plan };
  saveUsers(users);
  return users[index];
}

export function getApiKeys(userId: string): ApiKey[] {
  return getKeys()
    .filter((key) => key.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createApiKey(userId: string, input: ApiKeyInput): ApiKey {
  const fullKey = generateApiKey(input.environment);
  const key: ApiKey = {
    id: uid("key"),
    userId,
    name: input.name.trim() || "API key chưa đặt tên",
    key: fullKey,
    prefix: fullKey.slice(0, input.environment === "production" ? 13 : 13),
    environment: input.environment,
    scopes: input.scopes.length > 0 ? input.scopes : ["chat"],
    createdAt: new Date().toISOString(),
    lastUsed: null,
    status: "active",
  };
  const keys = getKeys();
  keys.push(key);
  saveKeys(keys);
  return key;
}

export function revokeApiKey(userId: string, keyId: string): void {
  const keys = getKeys();
  const index = keys.findIndex((key) => key.id === keyId && key.userId === userId);
  if (index !== -1) {
    keys[index] = { ...keys[index], status: "revoked" };
    saveKeys(keys);
  }
}

export function requestPasswordReset(email: string): { token: string | null; exists: boolean } {
  const normalized = email.trim().toLowerCase();
  const user = getUsers().find((item) => item.email.toLowerCase() === normalized);
  if (!user) return { token: null, exists: false };
  const token = randomToken(40);
  const resets = readJSON<ResetToken[]>(STORAGE_KEYS.resets, []);
  resets.push({
    token,
    email: normalized,
    expiresAt: Date.now() + 1000 * 60 * 30,
    used: false,
  });
  writeJSON(STORAGE_KEYS.resets, resets);
  return { token, exists: true };
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ user?: User; error?: string }> {
  const resets = readJSON<ResetToken[]>(STORAGE_KEYS.resets, []);
  const reset = resets.find((item) => item.token === token);
  if (!reset || reset.used) {
    return { error: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã được sử dụng." };
  }
  if (reset.expiresAt < Date.now()) {
    return { error: "Liên kết đặt lại mật khẩu đã hết hạn. Hãy yêu cầu một liên kết mới." };
  }
  const users = getUsers();
  const index = users.findIndex((item) => item.email === reset.email);
  if (index === -1) {
    return { error: "Không tìm thấy tài khoản cho liên kết này." };
  }
  users[index] = {
    ...users[index],
    passwordHash: await hashPassword(password, reset.email),
  };
  saveUsers(users);
  const updated = resets.map((item) =>
    item.token === token ? { ...item, used: true } : item,
  );
  writeJSON(STORAGE_KEYS.resets, updated);
  createSession(users[index].id);
  return { user: users[index] };
}

export const DEMO_CREDENTIALS = {
  email: DEMO_EMAIL,
  password: "deepsi2026",
} as const;
