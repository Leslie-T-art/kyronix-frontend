/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AUTH_BASE_URL?: string;
  readonly OLTS_BASE_URL?: string;
  readonly KRI_BASE_URL?: string;
  readonly NOTIFICATIONS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
