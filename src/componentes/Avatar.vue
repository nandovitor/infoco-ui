<script setup lang="ts">
/** Foto redonda de 40 px, ou as iniciais em branco-gelo quando não há foto. */
import { computed } from 'vue';

const props = defineProps<{ nome: string; foto?: string | null }>();
const iniciais = computed(() => props.nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join(''));
</script>

<template>
  <span class="iu-avatar" aria-hidden="true">
    <img v-if="foto" :src="foto" alt="">
    <template v-else>{{ iniciais }}</template>
  </span>
</template>
