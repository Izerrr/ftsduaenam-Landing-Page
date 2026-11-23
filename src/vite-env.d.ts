/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISCORD_INVITE_URL?: string;
  readonly NEXT_PUBLIC_DISCORD_INVITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
