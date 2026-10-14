/**
 * O agente para quem tem build com Vite (o sistema interno, os apps em Vue):
 * o estilo e o símbolo vêm do kit.
 *
 *   import { montarAgente } from 'infoco-ui/agente';
 *   const tirar = montarAgente({ endpoint: '/api/agente' });
 */
import '../estilo/estilo.css';
import simbolo from '../assets/simbolo.png';
import { montarAgenteCom, type OpcoesAgente } from './montagem';

export type { OpcoesAgente };
export { default as AgenteInfoco } from './AgenteInfoco.vue';

export const montarAgente = (opcoes: Partial<OpcoesAgente> = {}) => montarAgenteCom({ simbolo, ...opcoes });
