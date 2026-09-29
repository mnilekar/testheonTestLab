/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_ORIGIN?: string;
  readonly PUBLIC_ROBOTS_POLICY?: string;
  readonly PUBLIC_DEPLOY_TARGET?: 'local' | 'staging' | 'production';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
