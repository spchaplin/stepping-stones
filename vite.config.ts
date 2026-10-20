import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

// Lossless HTML whitespace minification plugin for production builds
function htmlMinifyPlugin(): Plugin {
  return {
    name: 'html-minifier',
    apply: 'build',
    transformIndexHtml(html: string) {
      return html
        .replace(/\n\s*/g, '')
        .replace(/<!--[\s\S]*?-->/g, '');
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), htmlMinifyPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // Explicitly configure lossless code and style minification for production
      minify: 'esbuild',
      cssMinify: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (
                id.includes('react') ||
                id.includes('react-dom') ||
                id.includes('react-router') ||
                id.includes('motion')
              ) {
                return 'vendor-framework';
              }
            }
          },
        },
      },
    },
    esbuild: {
      minifyWhitespace: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      legalComments: 'none',
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
