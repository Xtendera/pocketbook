// @ts-check

import { NextConfig } from 'next';
import { env } from './src/server/env';
import { execSync } from 'child_process';
import pkg from './package.json';

// Get the git commit hash at build time
const getCommitHash = () => {
  try {
    return execSync('git log --pretty=format:"%h" -n1').toString().trim();
  } catch (error) {
    console.warn('Unable to get git commit hash:', error);
    return 'unknown';
  }
};

const commitHash = getCommitHash();

/**
 * @see https://nextjs.org/docs/api-reference/next.config.js/introduction
 */
export default {
  /**
   * Dynamic configuration available for the browser and server.
   * Note: requires `ssr: true` or a `getInitialProps` in `_app.tsx`
   * @see https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration
   */
  publicRuntimeConfig: {
    NODE_ENV: env.NODE_ENV,
    APP_VERSION: pkg.version,
    COMMIT_HASH: commitHash,
  },
  /** We run eslint as a separate task in CI */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /** We run typechecking as a separate task in CI */
  typescript: {
    ignoreBuildErrors: true,
  },
  /** Enable standalone output for Docker optimization */
  output: 'standalone',
  /** Disable compression to prevent conflicts with Cloudflare tunnels */
  compress: false,
} satisfies NextConfig;
