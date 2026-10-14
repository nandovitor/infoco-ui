import { ref } from 'vue';

/** Qual menu de ações está aberto: um por vez na página inteira. */
export const menuAberto = ref<string | null>(null);
