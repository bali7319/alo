// Keep a single source of truth for Next config.
// Some environments may pick `next.config.mjs`; re-export the CJS config to avoid accidental empty config usage.
import nextConfig from './next.config.js';

export default nextConfig;
