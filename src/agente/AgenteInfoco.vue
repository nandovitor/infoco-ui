<script setup lang="ts">
/**
 * Agente INFOCO: o símbolo flutuando no canto inferior direito e, ao tocar,
 * o painel de conversa no desenho do chat do FAQ (400 × 600, raio 18, fundo
 * branco-gelo, balão azul de quem pergunta, branco com hairline da resposta,
 * sugestões em pílula de contorno azul, campo em pílula com envio de 44 px).
 * No celular o painel ocupa a tela. Esc fecha e devolve o foco ao botão.
 *
 * Só consulta (PNCP, TCM-BA, acervo de Processos do TCM, TCU, Transferegov,
 * DataJud): quem decide o que ele pode fazer é o servidor.
 */
import { onKeyStroke, useMediaQuery } from '@vueuse/core';
import { ArrowUp, RotateCcw, Square, X } from 'lucide-vue-next';
import { computed, nextTick, ref, watch } from 'vue';
import BlurText from '../vuebits/BlurText.vue';
import { anunciar } from '../util';
import { usarConversa } from './conversa';
import Texto from './Texto.vue';

const props = withDefaults(defineProps<{
  /** Onde a pergunta é enviada: `/api/agente` no sistema interno e no FAQ. */
  endpoint?: string;
  /** Endereço do símbolo da INFOCO. */
  simbolo: string;
  /** Para onde mandar quando a sessão termina. */
  entrar?: string;
}>(), { endpoint: '/api/agente', entrar: '/' });

const EXEMPLOS = [
  'Quais licitações a Prefeitura de Itabuna informou ao TCM em 2026?',
  'Busque no PNCP pregões de merenda escolar na Bahia',
  'O que a Lei 14.133 diz sobre inexigibilidade?',
];

const { estado, enviar, repetir, parar, nova } = usarConversa(props.endpoint);
const semMovimento = useMediaQuery('(prefers-reduced-motion: reduce)');
const aberto = ref(false);
const pergunta = ref('');
const botao = ref<HTMLButtonElement | null>(null);
const campo = ref<HTMLTextAreaElement | null>(null);
const rolagem = ref<HTMLElement | null>(null);

const enviando = computed(() => estado.situacao === 'enviando');
const vazia = computed(() => estado.mensagens.length === 0);
const ultima = computed(() => estado.mensagens[estado.mensagens.length - 1]);

const abrir = async () => {
  aberto.value = true;
  await nextTick();
  rolarParaFim();
  campo.value?.focus();
};
const fechar = () => {
  aberto.value = false;
  void nextTick(() => botao.value?.focus());
};
onKeyStroke('Escape', (e) => { if (aberto.value) { e.preventDefault(); fechar(); } });

const ajustarAltura = () => {
  const c = campo.value;
  if (!c) return;
  c.style.height = 'auto';
  c.style.height = `${Math.min(c.scrollHeight, 132)}px`;
};

const mandar = (texto = pergunta.value) => {
  if (!texto.trim() || enviando.value) return;
  void enviar(texto);
  pergunta.value = '';
  void nextTick(ajustarAltura);
};

const aoTeclar = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); mandar(); }
};

const rolarParaFim = () => {
  const r = rolagem.value;
  if (r) r.scrollTop = r.scrollHeight;
};
// Segue o texto que chega, a não ser que a pessoa tenha subido para reler.
watch(() => [ultima.value?.texto, estado.consultando, estado.mensagens.length], () => {
  const r = rolagem.value;
  if (!r) return;
  const pertoDoFim = r.scrollHeight - r.scrollTop - r.clientHeight < 120;
  if (pertoDoFim) void nextTick(rolarParaFim);
});
watch(enviando, (agora, antes) => {
  if (antes && !agora) anunciar(ultima.value?.erro ? 'A resposta foi interrompida.' : 'Resposta pronta.');
});
</script>

<template>
  <div class="iu iu-agente">
    <button
      v-show="!aberto"
      ref="botao"
      type="button"
      class="iu-agente__botao"
      aria-label="Agente INFOCO: pergunte sobre um processo"
      aria-haspopup="dialog"
      @click="abrir"
    >
      <img :src="simbolo" alt="" width="36" height="36">
      <span class="iu-agente__dica" aria-hidden="true">Agente INFOCO</span>
    </button>

    <section
      v-if="aberto"
      class="iu-agente__painel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="iu-agente-titulo"
    >
      <header class="iu-agente__cabeca">
        <img :src="simbolo" alt="" width="34" height="34" class="iu-agente__marca">
        <div class="iu-agente__nome">
          <h2 id="iu-agente-titulo">Agente INFOCO</h2>
          <p>PNCP, TCM-BA e outras fontes públicas</p>
        </div>
        <button v-if="!vazia" type="button" class="iu-botao iu-botao--icone" aria-label="Nova conversa" title="Nova conversa" @click="nova">
          <RotateCcw class="iu-icone" aria-hidden="true" />
        </button>
        <button type="button" class="iu-botao iu-botao--icone" aria-label="Fechar" title="Fechar" @click="fechar">
          <X class="iu-icone" aria-hidden="true" />
        </button>
      </header>

      <div ref="rolagem" class="iu-agente__mensagens">
        <div v-if="vazia" class="iu-agente__vazio">
          <p v-if="semMovimento" class="iu-agente__boas-vindas">Pergunte sobre um processo</p>
          <BlurText v-else text="Pergunte sobre um processo" :delay="90" animate-by="words" direction="top" class-name="iu-agente__boas-vindas" />
          <p class="iu-agente__explica">Licitações, contratos e pagamentos no PNCP e no TCM-BA, processos coletados do e-TCM e a base do TCU.</p>
          <ul class="iu-agente__exemplos" aria-label="Perguntas de exemplo">
            <li v-for="ex in EXEMPLOS" :key="ex">
              <button type="button" @click="mandar(ex)">{{ ex }}</button>
            </li>
          </ul>
        </div>

        <template v-for="m in estado.mensagens" :key="m.id">
          <p v-if="m.papel === 'pessoa'" class="iu-agente__balao iu-agente__balao--pessoa">{{ m.texto }}</p>
          <article v-else-if="m.texto || m.erro" class="iu-agente__balao iu-agente__balao--agente" aria-label="Resposta do agente">
            <Texto v-if="m.texto" :texto="m.texto" />
            <p v-if="m.fontes?.length" class="iu-agente__fontes">
              Fontes:
              <template v-for="(f, i) in m.fontes" :key="f.rotulo">
                <template v-if="i"> · </template>
                <a v-if="f.url" :href="f.url" target="_blank" rel="noopener noreferrer">{{ f.rotulo }}</a>
                <template v-else>{{ f.rotulo }}</template>
              </template>
            </p>
            <p v-if="m.erro" class="iu-agente__erro">
              {{ m.erro }}
              <button v-if="m === ultima && !enviando" type="button" class="iu-botao iu-botao--discreto" @click="repetir">Tentar novamente</button>
            </p>
          </article>
        </template>

        <p v-if="enviando && (estado.consultando || !ultima?.texto)" class="iu-agente__consultando" role="status">
          <span class="iu-agente__pontos" aria-hidden="true"><i /><i /><i /></span>
          {{ estado.consultando || 'Pensando…' }}
        </p>

        <div v-if="estado.situacao === 'sessao'" class="iu-agente__aviso" role="alert">
          <p>Sua sessão terminou. Entre novamente para continuar.</p>
          <a :href="entrar" class="iu-botao iu-botao--azul">Entrar</a>
        </div>
        <p v-else-if="estado.aviso" class="iu-agente__aviso" role="alert">{{ estado.aviso }}</p>
      </div>

      <form class="iu-agente__entrada" @submit.prevent="mandar()">
        <label for="iu-agente-pergunta" class="iu-so-leitor">Sua pergunta</label>
        <textarea
          id="iu-agente-pergunta"
          ref="campo"
          v-model="pergunta"
          rows="1"
          maxlength="4000"
          placeholder="Pergunte sobre um processo…"
          :disabled="estado.situacao === 'sessao'"
          @input="ajustarAltura"
          @keydown="aoTeclar"
        />
        <button v-if="enviando" type="button" class="iu-agente__enviar" aria-label="Parar a resposta" @click="parar">
          <Square class="iu-icone" aria-hidden="true" />
        </button>
        <button v-else type="submit" class="iu-agente__enviar" aria-label="Enviar" :disabled="!pergunta.trim() || estado.situacao === 'sessao'">
          <ArrowUp class="iu-icone" aria-hidden="true" />
        </button>
      </form>
      <p class="iu-agente__rodape">O agente só consulta fontes públicas. Confira os dados na fonte antes de usar.</p>
    </section>
  </div>
</template>

<style>
.iu-agente { position: fixed; right: 0; bottom: 0; z-index: 90; }

/* ── o símbolo flutuando ── */
/* Tela com ação no canto (o "Enviar" de um chat) sobe o botão com --iu-agente-baixo. */
.iu-agente__botao {
  position: fixed; right: 22px; bottom: var(--iu-agente-baixo, 22px);
  width: 60px; height: 60px; padding: 0; border: 1px solid var(--iu-linha); border-radius: 50%;
  background: var(--iu-branco); display: grid; place-items: center; cursor: pointer;
  box-shadow: 0 8px 20px -6px rgba(18, 59, 115, 0.35);
  animation: iu-flutuar 4s ease-in-out infinite;
  transition: transform 0.18s;
}
.iu-agente__botao:hover { transform: scale(1.06); animation-play-state: paused; }
.iu-agente__botao:active { transform: scale(0.96); }
.iu-agente__botao img { width: 36px; height: 36px; display: block; }
@keyframes iu-flutuar { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
.iu-agente__dica {
  position: absolute; right: calc(100% + 10px); top: 50%; translate: 0 -50%;
  background: var(--iu-tinta); color: #fff; font-size: 13px; font-weight: 600; white-space: nowrap;
  padding: 7px 13px; border-radius: 9999px; opacity: 0; pointer-events: none; transition: opacity 0.18s;
}
.iu-agente__botao:hover .iu-agente__dica, .iu-agente__botao:focus-visible .iu-agente__dica { opacity: 1; }

/* ── o painel ── */
.iu-agente__painel {
  position: fixed; right: 22px; bottom: 22px;
  width: min(400px, calc(100vw - 32px)); height: min(600px, calc(100dvh - 44px));
  display: flex; flex-direction: column; overflow: hidden;
  background: var(--iu-branco); border: 1px solid var(--iu-linha); border-radius: var(--iu-raio-cartao);
  box-shadow: var(--iu-sombra-flutuante);
}
.iu-agente__cabeca { display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 16px; border-bottom: 1px solid var(--iu-divisor); }
.iu-agente__marca { width: 34px; height: 34px; flex: none; }
.iu-agente__nome { flex: 1 1 auto; min-width: 0; }
.iu-agente__nome h2 { font-size: 15px; font-weight: 600; line-height: 1.25; }
.iu-agente__nome p { font-size: 13px; color: var(--iu-tinta-48); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.iu-agente__mensagens {
  flex: 1 1 auto; overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: 12px; padding: 16px; background: var(--iu-gelo);
}
.iu-agente__vazio { display: flex; flex-direction: column; gap: 10px; margin-top: auto; }
.iu-agente__boas-vindas { font-size: 21px; font-weight: 600; line-height: 1.2; color: var(--iu-tinta); }
.iu-agente__explica { font-size: 14px; color: var(--iu-tinta-80); }
.iu-agente__exemplos { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; margin-top: 4px; }
.iu-agente__exemplos button {
  min-height: 44px; padding: 8px 14px; text-align: left;
  background: var(--iu-branco); border: 1px solid var(--iu-azul); border-radius: 22px;
  color: var(--iu-azul); font-size: 14px; line-height: 1.35; cursor: pointer; transition: background 0.15s, color 0.15s;
}
.iu-agente__exemplos button:hover { background: var(--iu-azul); color: #fff; }

.iu-agente__balao {
  max-width: 88%; padding: 11px 15px; border-radius: 18px;
  font-size: 15px; line-height: 1.45; overflow-wrap: anywhere;
}
.iu-agente__balao--pessoa { align-self: flex-end; background: var(--iu-azul); color: #fff; border-bottom-right-radius: 5px; white-space: pre-wrap; }
.iu-agente__balao--agente { align-self: flex-start; background: var(--iu-branco); border: 1px solid var(--iu-linha); border-bottom-left-radius: 5px; }
.iu-agente__texto { display: flex; flex-direction: column; gap: 8px; }
.iu-agente__texto ul, .iu-agente__texto ol { display: flex; flex-direction: column; gap: 4px; padding-left: 20px; }
.iu-agente__texto ul { list-style: disc; }
.iu-agente__texto ol { list-style: decimal; }
.iu-agente__texto strong { font-weight: 600; }
.iu-agente__subtitulo { font-weight: 600; }
.iu-agente__fontes { margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--iu-divisor); font-size: 13px; color: var(--iu-tinta-48); }
.iu-agente__erro { margin-top: 8px; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 8px; font-size: 14px; color: var(--iu-erro); }

.iu-agente__consultando { align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; font-size: 14px; color: var(--iu-tinta-80); }
.iu-agente__pontos { display: inline-flex; gap: 3px; }
.iu-agente__pontos i { width: 6px; height: 6px; border-radius: 50%; background: var(--iu-azul); animation: iu-ponto 1.2s infinite ease-in-out; }
.iu-agente__pontos i:nth-child(2) { animation-delay: 0.15s; }
.iu-agente__pontos i:nth-child(3) { animation-delay: 0.3s; }
@keyframes iu-ponto { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }

.iu-agente__aviso { display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: var(--iu-raio-campo); background: var(--iu-aviso-fundo); color: var(--iu-aviso); font-size: 14px; }

.iu-agente__entrada { display: flex; align-items: flex-end; gap: 8px; padding: 12px; border-top: 1px solid var(--iu-divisor); background: var(--iu-branco); }
.iu-agente__entrada textarea {
  flex: 1 1 auto; min-height: 44px; max-height: 132px; resize: none;
  padding: 11px 18px; border: 1px solid var(--iu-linha); border-radius: 22px; outline: none;
  font-size: 16px; line-height: 1.35; background: var(--iu-branco);
}
.iu-agente__entrada textarea:focus { border-color: var(--iu-azul-foco); }
.iu-agente__enviar {
  width: 44px; height: 44px; flex: none; border: 0; border-radius: 50%;
  display: grid; place-items: center; background: var(--iu-azul); color: #fff; cursor: pointer;
}
.iu-agente__enviar:hover:not(:disabled) { background: var(--iu-azul-foco); }
.iu-agente__enviar:disabled { opacity: 0.4; cursor: default; }
.iu-agente__rodape { padding: 0 12px 10px; background: var(--iu-branco); font-size: 13px; line-height: 1.35; color: var(--iu-tinta-48); text-align: center; }

@media (max-width: 480px) {
  .iu-agente__botao { right: 14px; bottom: var(--iu-agente-baixo, 14px); }
  .iu-agente__dica { display: none; }
  .iu-agente__painel { inset: 0; width: 100%; height: 100dvh; border: 0; border-radius: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .iu-agente__botao { animation: none; transition: none; }
  .iu-agente__pontos i { animation: none; opacity: 0.7; }
}
@media print { .iu-agente { display: none; } }
</style>
