import { createApp } from 'vue';
import AgenteInfoco from './AgenteInfoco.vue';
import type { Contexto } from './conversa';
import type { OpcoesVoz } from './voz';

export interface OpcoesAgente {
  /** Onde a pergunta é enviada. Padrão: `/api/agente`. */
  endpoint?: string;
  /** Endereço do símbolo da INFOCO. */
  simbolo: string;
  /** Para onde mandar quando a sessão termina. Padrão: `/`. */
  entrar?: string;
  /** Perguntas de exemplo do painel vazio (até 4). */
  exemplos?: string[];
  /** A linha que diz o que o agente faz, no painel vazio. */
  descricao?: string;
  /** A linha embaixo do nome, no cabeçalho. */
  subtitulo?: string;
  /** Onde a pessoa está na página (seção, trecho), lido a cada pergunta. */
  contexto?: () => Contexto | undefined;
  /** Liga a leitura em voz alta (e a voz do Uilber). */
  voz?: OpcoesVoz;
}

/** O que a página pode pedir ao agente depois de montado. */
export interface ControleAgente {
  abrir: (texto?: string) => void;
  fechar: () => void;
  perguntar: (texto: string) => void;
  comTrecho: (texto: string, secao?: string) => void;
  tirar: () => void;
}

/** Põe o agente na página (num `div` próprio no fim do `body`) e devolve o controle dele. */
export const montarAgenteCom = (opcoes: OpcoesAgente): ControleAgente => {
  const lugar = document.createElement('div');
  lugar.dataset.agenteInfoco = '';
  document.body.append(lugar);
  const app = createApp(AgenteInfoco, { ...opcoes });
  const agente = app.mount(lugar) as unknown as Omit<ControleAgente, 'tirar'>;
  return {
    abrir: (texto) => agente.abrir(texto),
    fechar: () => agente.fechar(),
    perguntar: (texto) => agente.perguntar(texto),
    comTrecho: (texto, secao) => agente.comTrecho(texto, secao),
    tirar: () => {
      app.unmount();
      lugar.remove();
    },
  };
};
