import type { NextConfig } from 'next';

const config: NextConfig = {
  // Type errors are caught by `pnpm typecheck` (its own quality gate), so the
  // build does not run the checker a second time.
  typescript: { ignoreBuildErrors: true },
};

export default config;
