<script setup lang="ts">
/** Campo de texto com rótulo ligado. `busca` põe a lupa e a forma de pílula do FAQ. */
import { Search } from 'lucide-vue-next';

withDefaults(defineProps<{
  id: string;
  rotulo: string;
  rotuloOculto?: boolean;
  tipo?: 'text' | 'search' | 'email' | 'number' | 'date';
  placeholder?: string;
  busca?: boolean;
}>(), { tipo: 'text' });
const valor = defineModel<string>({ default: '' });
</script>

<template>
  <div class="iu-campo">
    <label :for="id" class="iu-campo__rotulo" :class="{ 'iu-so-leitor': rotuloOculto }">{{ rotulo }}</label>
    <span v-if="busca" class="iu-campo__busca">
      <Search class="iu-icone iu-campo__lupa" aria-hidden="true" />
      <input :id="id" v-model="valor" class="iu-entrada iu-entrada--busca" type="search" :placeholder="placeholder" autocomplete="off" spellcheck="false">
    </span>
    <input v-else :id="id" v-model="valor" class="iu-entrada" :type="tipo" :placeholder="placeholder">
  </div>
</template>
