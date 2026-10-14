<script setup lang="ts">
/**
 * A lista do menu "Ações", que só existe enquanto o menu está aberto: fecha
 * com clique fora, com Esc e quando a janela perde o foco (clique fora de um
 * iframe). Sem espaço embaixo, abre para cima.
 */
import { onClickOutside, onKeyStroke, useEventListener } from '@vueuse/core';
import { computed, onMounted, ref } from 'vue';

export interface ItemMenu { acao: string; texto: string; desativado?: boolean }

const props = defineProps<{ id: string; rotuladoPor: string; itens: ItemMenu[]; noUltimo: boolean; botao: HTMLElement | null }>();
const emit = defineEmits<{ fechar: [devolverFoco: boolean]; escolher: [item: ItemMenu] }>();

const menu = ref<HTMLUListElement | null>(null);
const acima = ref(false);
const itensDoMenu = () => [...(menu.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];

onClickOutside(menu, () => emit('fechar', false), { ignore: [computed(() => props.botao)] });
onKeyStroke('Escape', (e) => { e.preventDefault(); emit('fechar', true); });
useEventListener(window, 'blur', () => emit('fechar', false));

onMounted(() => {
  if (!menu.value) return;
  const caixa = menu.value.getBoundingClientRect();
  acima.value = caixa.bottom > document.documentElement.clientHeight && (props.botao?.getBoundingClientRect().top ?? 0) > caixa.height;
  const itens = itensDoMenu();
  (props.noUltimo ? itens[itens.length - 1] : itens[0])?.focus();
});

const aoTeclar = (e: KeyboardEvent) => {
  const itens = itensDoMenu();
  const i = itens.indexOf(document.activeElement as HTMLElement);
  if (e.key === 'Tab') emit('fechar', false);
  else if (e.key === 'ArrowDown') { e.preventDefault(); itens[(i + 1) % itens.length]?.focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); itens[(i - 1 + itens.length) % itens.length]?.focus(); }
  else if (e.key === 'Home') { e.preventDefault(); itens[0]?.focus(); }
  else if (e.key === 'End') { e.preventDefault(); itens[itens.length - 1]?.focus(); }
};
</script>

<template>
  <ul :id="id" ref="menu" class="iu-menu" :class="{ 'iu-menu--acima': acima }" role="menu" :aria-labelledby="rotuladoPor" @keydown="aoTeclar">
    <li v-for="item in itens" :key="item.acao" role="none">
      <button type="button" role="menuitem" tabindex="-1" class="iu-menu__item" :aria-disabled="item.desativado ? 'true' : undefined" @click="emit('escolher', item)">
        {{ item.texto }}
      </button>
    </li>
  </ul>
</template>
