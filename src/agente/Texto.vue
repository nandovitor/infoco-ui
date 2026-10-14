<script setup lang="ts">
/** Desenha a resposta formatada (parágrafo, lista, negrito, link) sem HTML pronto. */
import { computed } from 'vue';
import { formatar, type Trecho } from './formatar';

const props = defineProps<{ texto: string }>();
const blocos = computed(() => formatar(props.texto));
const chave = (t: Trecho, i: number) => `${i}-${t.tipo}`;
</script>

<template>
  <div class="iu-agente__texto">
    <template v-for="(b, i) in blocos" :key="i">
      <p v-if="b.tipo === 'p' || b.tipo === 'titulo'" :class="{ 'iu-agente__subtitulo': b.tipo === 'titulo' }">
        <template v-for="(t, j) in b.trechos" :key="chave(t, j)">
          <strong v-if="t.tipo === 'negrito'">{{ t.texto }}</strong>
          <a v-else-if="t.tipo === 'link'" :href="t.href" target="_blank" rel="noopener noreferrer">{{ t.texto }}</a>
          <template v-else>{{ t.texto }}</template>
        </template>
      </p>
      <component :is="b.tipo" v-else>
        <li v-for="(item, k) in b.itens" :key="k">
          <template v-for="(t, j) in item" :key="chave(t, j)">
            <strong v-if="t.tipo === 'negrito'">{{ t.texto }}</strong>
            <a v-else-if="t.tipo === 'link'" :href="t.href" target="_blank" rel="noopener noreferrer">{{ t.texto }}</a>
            <template v-else>{{ t.texto }}</template>
          </template>
        </li>
      </component>
    </template>
  </div>
</template>
