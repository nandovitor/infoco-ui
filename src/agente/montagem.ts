import { createApp } from 'vue';
import AgenteInfoco from './AgenteInfoco.vue';

export interface OpcoesAgente {
  /** Onde a pergunta é enviada. Padrão: `/api/agente`. */
  endpoint?: string;
  /** Endereço do símbolo da INFOCO. */
  simbolo: string;
  /** Para onde mandar quando a sessão termina. Padrão: `/`. */
  entrar?: string;
}

/** Põe o agente na página (num `div` próprio no fim do `body`) e devolve como tirar. */
export const montarAgenteCom = (opcoes: OpcoesAgente) => {
  const lugar = document.createElement('div');
  lugar.dataset.agenteInfoco = '';
  document.body.append(lugar);
  const app = createApp(AgenteInfoco, { ...opcoes });
  app.mount(lugar);
  return () => {
    app.unmount();
    lugar.remove();
  };
};
