<script setup lang="ts">
/** A linha de números: só os que mudam a decisão. Valor grande em cima, rótulo escrito embaixo. */
defineProps<{ itens: { rotulo: string; valor: string | number }[] }>();
</script>

<template>
  <dl class="iu-numeros">
    <div v-for="item in itens" :key="item.rotulo" class="iu-numeros__item">
      <dt class="iu-numeros__rotulo">{{ item.rotulo }}</dt>
      <dd class="iu-numeros__valor">{{ item.valor }}</dd>
    </div>
  </dl>
</template>
