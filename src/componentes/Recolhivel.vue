<script setup lang="ts">
/** O raro fica em `details` nativo: teclado e estado aberto de graça. `v-model:aberto` é opcional. */
import { ChevronDown } from 'lucide-vue-next';

defineProps<{ titulo: string }>();
const aberto = defineModel<boolean>('aberto', { default: false });
</script>

<template>
  <details class="iu-recolhivel" :open="aberto" @toggle="aberto = ($event.target as HTMLDetailsElement).open">
    <summary>
      <slot name="titulo">{{ titulo }}</slot>
      <ChevronDown class="iu-recolhivel__seta" aria-hidden="true" />
    </summary>
    <div class="iu-recolhivel__corpo"><slot /></div>
  </details>
</template>
