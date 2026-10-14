<script setup lang="ts">
/** Filtro de tipo em pílulas (o "Todos · Homologadas · Contratos" do e-TCM). */
defineProps<{ rotulo: string; opcoes: { id: string; rotulo: string }[] }>();
const escolhido = defineModel<string>({ required: true });
</script>

<template>
  <div class="iu-segmentos" role="group" :aria-label="rotulo">
    <button
      v-for="o in opcoes"
      :key="o.id"
      type="button"
      class="iu-segmento"
      :aria-pressed="escolhido === o.id"
      @click="escolhido = o.id"
    >{{ o.rotulo }}</button>
  </div>
</template>
