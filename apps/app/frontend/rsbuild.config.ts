import { defineConfig } from '@rsbuild/core';
import { pluginBabel } from '@rsbuild/plugin-babel';
import { pluginSolid } from '@rsbuild/plugin-solid';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [
    pluginBabel({
      include: /\.(?:jsx|tsx)$/,
    }),
    pluginSolid(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5150',
        changeOrigin: true,
      },
    },
  },
});
