/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_LLM_BASE_URL?: string;
  readonly VITE_SITE_NAME?: string;
  readonly VITE_SITE_DOMAIN?: string;
  readonly VITE_SITE_EMAIL?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
  readonly VITE_OAUTH_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
