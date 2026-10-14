/**
 * O agente para páginas sem Vue nem build (FAQ e Documentos para o TCM): o
 * `dist/agente.js` se monta sozinho a partir dos atributos da própria tag.
 *
 *   <link rel="stylesheet" href="/assets/agente.css">
 *   <script>window.agenteInfocoOpcoes = { exemplos: [...], voz: { endpoint: '/api/ia/voz', uilber: true } };</script>
 *   <script src="/assets/agente.js" defer
 *           data-endpoint="/api/agente" data-simbolo="/assets/logo-simbolo.png" data-entrar="/login"></script>
 *
 * O símbolo entra por endereço, nunca embutido: há páginas cuja política de
 * segurança não aceita `data:`.
 *
 * Compatibilidade com a Infoco I.A que o agente substituiu no FAQ: o contexto
 * vem de `window.__iaContexto()` quando a página o define, e o controle fica
 * em `window.infocoIA` (abrir, fechar, perguntar, comTrecho), além de
 * `window.agenteInfoco`.
 */
import '../estilo/estilo.css';
import { montarAgenteCom, type ControleAgente, type OpcoesAgente } from './montagem';

declare global {
  interface Window {
    agenteInfocoOpcoes?: Partial<OpcoesAgente>;
    agenteInfoco?: ControleAgente;
    infocoIA?: Omit<ControleAgente, 'tirar'>;
    __iaContexto?: () => { secao?: string; trecho?: string } | undefined;
  }
}

const tag = document.currentScript as HTMLScriptElement | null;
const dados = tag?.dataset ?? {};

const montar = () => {
  const extra = window.agenteInfocoOpcoes ?? {};
  const agente = montarAgenteCom({
    endpoint: dados.endpoint || '/api/agente',
    simbolo: dados.simbolo || '/assets/logo-simbolo.png',
    entrar: dados.entrar || '/login',
    contexto: () => window.__iaContexto?.(),
    ...extra,
  });
  window.agenteInfoco = agente;
  window.infocoIA = { abrir: agente.abrir, fechar: agente.fechar, perguntar: agente.perguntar, comTrecho: agente.comTrecho };
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar, { once: true });
else montar();
