<script setup lang="ts">
/** Nome em 17 px, detalhe em 14 px secundário e as ações à direita (embaixo, no celular). */
defineProps<{ titulo: string; detalhe?: string }>();
</script>

<template>
  <li class="iu-linha">
    <slot name="inicio" />
    <div class="iu-linha__texto">
      <p class="iu-linha__titulo"><slot name="titulo">{{ titulo }}</slot></p>
      <p v-if="detalhe || $slots.detalhe" class="iu-linha__detalhe"><slot name="detalhe">{{ detalhe }}</slot></p>
    </div>
    <div v-if="$slots.default" class="iu-linha__acoes"><slot /></div>
  </li>
</template>
