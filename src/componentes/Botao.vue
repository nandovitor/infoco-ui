<script setup lang="ts">
/**
 * Um azul por contexto (`azul`, a ação principal); o resto é `neutro`,
 * `discreto` ou `icone` (44 px, com nome para leitor de tela em `rotulo`).
 * Com `href` vira link com a mesma aparência.
 */
import { LoaderCircle } from 'lucide-vue-next';

withDefaults(defineProps<{
  variante?: 'azul' | 'neutro' | 'discreto' | 'icone';
  tipo?: 'button' | 'submit';
  rotulo?: string;
  href?: string;
  desativado?: boolean;
  carregando?: boolean;
}>(), { variante: 'neutro', tipo: 'button' });
</script>

<template>
  <a v-if="href" :href="href" class="iu-botao" :class="`iu-botao--${variante}`" :aria-label="rotulo" target="_blank" rel="noopener">
    <slot />
  </a>
  <button
    v-else
    :type="tipo"
    class="iu-botao"
    :class="`iu-botao--${variante}`"
    :aria-label="rotulo"
    :disabled="desativado || carregando"
    :aria-busy="carregando || undefined"
  >
    <LoaderCircle v-if="carregando" class="iu-icone iu-gira" aria-hidden="true" />
    <slot />
  </button>
</template>
