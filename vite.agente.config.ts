// O agente em um arquivo só (`dist/agente.js` + `dist/agente.css`), com o Vue
// dentro, para páginas que não usam Vue: o FAQ e os Documentos para o TCM.
// Vai para o git: a instalação pelo GitHub não roda build.
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: 'src/agente/autonomo.ts',
      name: 'AgenteInfoco',
      formats: ['iife'],
      fileName: () => 'agente.js',
      cssFileName: 'agente',
    },
  },
});
