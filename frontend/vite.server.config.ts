import type { Plugin } from 'vite';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tsconfigPaths from 'vite-tsconfig-paths';

/**
 * This file is used separately from `vite.config.ts` to build the server
 * runtime that bootstraps the application.
 *
 * While `vite.config.ts` is typically focused on the react-router application
 * build, this configuration is tailored specifically for building the server
 * runtime, ensuring optimized deployment for Node.js.
 */

export default defineConfig({
  build: {
    // Disable copying the `public` directory, as it is not needed for the server runtime.
    copyPublicDir: false,

    // Prevent Vite from clearing the `outDir` before building. This ensures that other assets
    // (e.g., client-side builds) remain intact in the `./build` directory.
    emptyOutDir: false,

    // Specifies the output directory for the server build.
    outDir: './build/server/',

    rollupOptions: {
      // Specifies the entry point for the server runtime.
      // This is the TypeScript file that Vite will start buildin from.
      input: ['./app/.server/telemetry.ts', './app/.server/express/server.ts'],
    },

    // Enables Server-Side Rendering (SSR) mode, optimizing the build process for Node.js.
    ssr: true,

    // Specifies the Node.js version compatibility for the generated output.
    // Setting `target: 'node22'` ensures compatibility with Node.js 22, enabling
    // features like ES modules, top-level await, and modern JavaScript syntax.
    target: 'node22',
  },
  plugins: [
    preserveImportMetaUrl(),
    // Integrates TypeScript path aliasing using the `vite-tsconfig-paths` plugin,
    // which resolves paths defined in `tsconfig.json` for cleaner imports.
    tsconfigPaths(),
    viteStaticCopy({
      // Copies static assets from the specified source directory to the build output directory.
      // This is necessary to bundle assets required by the server runtime, such as html templates
      // and additional files used by the Express server.
      targets: [{ src: './app/.server/express/assets/', dest: './' }],
    }),
  ],
});

/**
 * Creates a Vite plugin that replaces `getLogger(import.meta.url)` calls
 * with project-relative paths to ensure correct logging in bundled server code.
 */
export function preserveImportMetaUrl(): Plugin {
  return {
    name: 'preserve-import-meta-url',
    transform(code, id) {
      const truncatedPath = id.includes('app/') ? id.slice(id.indexOf('app/')) : id;
      return code.replaceAll('getLogger(import.meta.url)', `getLogger(${JSON.stringify(truncatedPath)})`);
    },
  };
}
