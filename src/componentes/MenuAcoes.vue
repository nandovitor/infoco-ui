<script setup lang="ts">
/**
 * O menu "Ações" do SICC: botão com aria-expanded; setas abrem e navegam, Esc
 * fecha e devolve o foco, Tab e clique fora fecham. Um menu aberto por vez na
 * página inteira.
 */
import { MoreHorizontal } from 'lucide-vue-next';
import { computed, ref, useId } from 'vue';
import MenuLista, { type ItemMenu } from './MenuLista.vue';
import { menuAberto } from './menuAberto';

const props = withDefaults(defineProps<{ nome: string; itens: ItemMenu[]; texto?: string }>(), { texto: 'Ações' });
const emit = defineEmits<{ acao: [acao: string] }>();

const id = useId();
const botao = ref<HTMLButtonElement | null>(null);
const noUltimo = ref(false);
const aberto = computed(() => menuAberto.value === id);

const abrir = (ultimo = false) => { noUltimo.value = ultimo; menuAberto.value = id; };
const fechar = (devolverFoco: boolean) => {
  if (!aberto.value) return;
  menuAberto.value = null;
  if (devolverFoco) botao.value?.focus();
};
const alternar = () => { if (aberto.value) fechar(true); else abrir(); };
const teclaNoBotao = (e: KeyboardEvent) => {
  if (aberto.value || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
  e.preventDefault();
  abrir(e.key === 'ArrowUp');
};
const escolher = (item: ItemMenu) => {
  if (item.desativado) return;
  fechar(true);
  emit('acao', item.acao);
};
</script>

<template>
  <div class="iu-acoes">
    <button
      :id="`acoes-${id}`"
      ref="botao"
      type="button"
      class="iu-botao iu-botao--neutro"
      aria-haspopup="menu"
      :aria-expanded="aberto"
      :aria-controls="`menu-${id}`"
      :aria-label="`${props.texto}: ${nome}`"
      @click="alternar"
      @keydown="teclaNoBotao"
    >
      <span aria-hidden="true">{{ props.texto }}</span>
      <MoreHorizontal class="iu-icone" aria-hidden="true" />
    </button>
    <MenuLista
      v-if="aberto"
      :id="`menu-${id}`"
      :rotulado-por="`acoes-${id}`"
      :itens="itens"
      :no-ultimo="noUltimo"
      :botao="botao"
      @fechar="fechar"
      @escolher="escolher"
    />
  </div>
</template>
