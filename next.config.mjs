import { execSync } from 'child_process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    GIT_COMMIT_HASH: (() => {
      try {
        return execSync('git rev-parse --short HEAD').toString().trim();
      } catch (error) {
        return 'unknown';
      }
    })(),
  },
};

export default nextConfig;
