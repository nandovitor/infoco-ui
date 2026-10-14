// A página de demonstração do kit (`npm run dev`): todo componente e estado
// numa tela só, para conferir a olho a cada versão.
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'demo',
  plugins: [vue()],
  build: { outDir: '../demo-dist', emptyOutDir: true },
  server: {
    // `/api/agente` do sistema interno rodando em 3000 (`npm run dev` lá).
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
});
