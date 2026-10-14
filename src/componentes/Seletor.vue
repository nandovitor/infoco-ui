<script setup lang="ts">
/**
 * O seletor padrão do SICC (@vitorfba/vue-treeselect), nas cores do FAQ, com
 * o que falta para leitor de tela: rótulo ligado ao campo, estado aberto e a
 * opção realçada dita em voz alta ao navegar pelas setas. Veio do Processos do
 * TCM (servicos/processos-tcm/web/src/componentes/Seletor.vue) sem o estado
 * daquela tela: aqui tudo entra por propriedade e sai por evento.
 *
 * O componente só recebe foco e teclado no modo de pesquisa, então ele fica
 * sempre ligado; com `pesquisavel` falso a digitação é barrada aqui e o
 * teclado de toque não sobe. Nesta versão do pacote o valor entra por `value`
 * (`modelValue` é declarada, mas não é lida); a saída é `update:modelValue`.
 */
import Treeselect from '@vitorfba/vue-treeselect';
import '@vitorfba/vue-treeselect/dist/vue3-treeselect.css';
import { computed, nextTick, onMounted, onUpdated, ref } from 'vue';
import { achatar, anunciar } from '../util';

export interface OpcaoSeletor { id: string; label: string; children?: OpcaoSeletor[]; isDisabled?: boolean }

const props = defineProps<{
  id: string;
  rotulo: string;
  rotuloOculto?: boolean;
  opcoes: OpcaoSeletor[];
  limpavel?: boolean;
  pesquisavel?: boolean;
  placeholder?: string;
}>();
const valor = defineModel<string | null>({ default: null });
const emit = defineEmits<{ abriu: []; fechou: [] }>();

const raiz = ref<HTMLElement | null>(null);
const arvore = ref<{ closeMenu?: () => void; _blurOnSelect?: boolean } | null>(null);
const aberto = ref(false);
const idCampo = computed(() => `${props.id}-campo`);

const planas = (lista: OpcaoSeletor[]): OpcaoSeletor[] => lista.flatMap((o) => [o, ...planas(o.children ?? [])]);
const escolhida = computed(() => planas(props.opcoes).find((o) => o.id === valor.value)?.label || '');
// A pesquisa do pacote não ignora acento: cada opção leva também o nome sem acento.
const comBusca = (lista: OpcaoSeletor[]): unknown[] =>
  lista.map((o) => ({ ...o, busca: achatar(o.label), ...(o.children ? { children: comBusca(o.children) } : {}) }));
const opcoesComBusca = computed(() => comBusca(props.opcoes));
const CHAVES_DE_BUSCA = ['label', 'busca'];

const aoMudar = (novo: string | null | undefined) => {
  const v = novo ?? null;
  if (v === null && !props.limpavel) return;
  if (v !== valor.value) valor.value = v;
};

/** O pacote não rotula o próprio campo: nome e valor entram aqui. */
const rotular = () => {
  const campo = raiz.value?.querySelector<HTMLElement>('.vue-treeselect__input');
  if (!campo) return;
  campo.id = idCampo.value;
  campo.setAttribute('role', 'combobox');
  campo.setAttribute('aria-haspopup', 'listbox');
  campo.setAttribute('aria-expanded', String(aberto.value));
  campo.setAttribute('aria-label', `${props.rotulo}: ${escolhida.value || props.placeholder || 'nenhuma opção escolhida'}`);
  if (props.pesquisavel) campo.removeAttribute('inputmode'); else campo.setAttribute('inputmode', 'none');
};
onMounted(rotular);
onUpdated(rotular);

const aoAbrir = () => { aberto.value = true; emit('abriu'); void nextTick(rotular); };
const aoFechar = () => {
  aberto.value = false;
  emit('fechou');
  void nextTick(() => {
    rotular();
    // Depois de escolher pelo teclado o pacote guarda uma marca que faz o próximo
    // clique abrir a lista sem pôr o foco no campo. A marca sai aqui.
    if (arvore.value) arvore.value._blurOnSelect = false;
  });
};

const aoTeclar = (e: KeyboardEvent) => {
  // O pacote abre a lista a qualquer tecla, até no Tab: aqui o Tab só passa adiante.
  if (e.key === 'Tab') { e.stopPropagation(); arvore.value?.closeMenu?.(); return; }
  if (!props.pesquisavel && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
  setTimeout(() => {
    const texto = raiz.value?.querySelector('.vue-treeselect__option--highlight .vue-treeselect__label')?.textContent;
    if (texto) anunciar(texto.trim());
  }, 0);
};
</script>

<template>
  <div :id="id" ref="raiz" class="iu-seletor" @keydown.capture="aoTeclar">
    <label :for="idCampo" class="iu-campo__rotulo" :class="{ 'iu-so-leitor': rotuloOculto }">{{ rotulo }}</label>
    <Treeselect
      ref="arvore"
      :value="valor"
      :model-value="valor"
      :options="opcoesComBusca"
      :match-keys="CHAVES_DE_BUSCA"
      :disable-fuzzy-matching="true"
      :multiple="false"
      :clearable="!!limpavel"
      :searchable="true"
      :backspace-removes="!!limpavel"
      :delete-removes="!!limpavel"
      :placeholder="placeholder || 'Selecione'"
      :instance-id="id"
      :z-index="20"
      open-direction="bottom"
      no-results-text="Nenhum resultado."
      no-options-text="Nenhuma opção."
      clear-value-text="Limpar"
      loading-text="Carregando…"
      search-prompt-text="Digite para procurar…"
      @update:model-value="aoMudar"
      @open="aoAbrir"
      @close="aoFechar"
    />
  </div>
</template>
