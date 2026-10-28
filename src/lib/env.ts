function trimSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function read(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function originOf(value: string): string {
  try {
    return new URL(value, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
}

const defaultApiUrl = import.meta.env.DEV
  ? "http://localhost:8080/api/v1"
  : "https://api.service.deepsi.space/api/v1";

export const API_BASE_URL = trimSlash(read(import.meta.env.VITE_API_URL) ?? defaultApiUrl);
export const API_ORIGIN = originOf(API_BASE_URL);
export const LLM_BASE_URL = trimSlash(
  read(import.meta.env.VITE_LLM_BASE_URL) ?? `${API_ORIGIN}/v1`,
);

export const SITE_NAME = read(import.meta.env.VITE_SITE_NAME) ?? "DeepSI Agent";
export const SITE_DOMAIN = read(import.meta.env.VITE_SITE_DOMAIN) ?? "service.deepsi.space";
export const SITE_EMAIL = read(import.meta.env.VITE_SITE_EMAIL) ?? "hello@deepsi.space";
export const SUPPORT_EMAIL = read(import.meta.env.VITE_SUPPORT_EMAIL) ?? "support@deepsi.space";
export const PARENT_DOMAIN = read(import.meta.env.VITE_PARENT_DOMAIN) ?? "deepsi.space";
export const PARENT_URL = trimSlash(
  read(import.meta.env.VITE_PARENT_URL) ?? `https://${PARENT_DOMAIN}`,
);
export const SECURITY_EMAIL =
  read(import.meta.env.VITE_SECURITY_EMAIL) ?? `security@${PARENT_DOMAIN}`;

export const OAUTH_ENABLED = import.meta.env.VITE_OAUTH_ENABLED !== "false";

export const API_HOST = (() => {
  try {
    return new URL(API_BASE_URL, window.location.origin).host;
  } catch {
    return SITE_DOMAIN;
  }
})();
