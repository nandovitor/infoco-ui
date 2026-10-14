<script setup lang="ts">
/** Estado é selo com ícone + palavra: a cor nunca diz o estado sozinha. */
import { CircleCheck, CircleDot, LoaderCircle, OctagonAlert, TriangleAlert } from 'lucide-vue-next';

defineProps<{ tipo: 'ok' | 'aviso' | 'risco' | 'neutro' | 'lendo'; texto: string }>();
const ICONES = { ok: CircleCheck, aviso: TriangleAlert, risco: OctagonAlert, neutro: CircleDot, lendo: LoaderCircle };
</script>

<template>
  <span class="iu-selo" :class="`iu-selo--${tipo}`">
    <component :is="ICONES[tipo]" class="iu-icone" :class="{ 'iu-gira': tipo === 'lendo' }" aria-hidden="true" />
    <span>{{ texto }}</span>
  </span>
</template>
