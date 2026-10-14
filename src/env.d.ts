/// <reference types="vite/client" />


// O pacote do seletor não traz tipos.
declare module '@vitorfba/vue-treeselect' {
  import type { DefineComponent } from 'vue';
  export const Treeselect: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default Treeselect;
}
