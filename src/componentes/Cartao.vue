<script setup lang="ts">
/** Um cartão branco por tela ou aba. Nunca cartão dentro de cartão: grupos se separam por espaço e hairline. */
withDefaults(defineProps<{ tag?: string; rotuladoPor?: string }>(), { tag: 'section' });
</script>

<template>
  <component :is="tag" class="iu iu-cartao" :aria-labelledby="rotuladoPor">
    <slot />
  </component>
</template>
