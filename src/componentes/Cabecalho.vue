<script setup lang="ts">
/** Título de 21 px e UMA linha dizendo para que a tela serve; ações à direita. */
defineProps<{ id: string; titulo: string; legenda?: string }>();
</script>

<template>
  <div class="iu-cabecalho">
    <div class="iu-cabecalho__texto">
      <h2 :id="id" class="iu-cabecalho__titulo">{{ titulo }}</h2>
      <p v-if="legenda || $slots.legenda" class="iu-cabecalho__legenda"><slot name="legenda">{{ legenda }}</slot></p>
    </div>
    <div v-if="$slots.default" class="iu-cabecalho__acoes"><slot /></div>
  </div>
</template>
