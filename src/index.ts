/**
 * infoco-ui — kit visual da INFOCO em Vue 3.
 *
 *   import 'infoco-ui/estilo.css';
 *   import 'infoco-ui/fonte.css';   // se a página ainda não carrega a Plus Jakarta Sans
 *   import { Cartao, Cabecalho, Seletor } from 'infoco-ui';
 *
 * Toda tela segue a "Regra minimalista" do apple.md (Infoco_Sistemas).
 */
export { default as Avatar } from './componentes/Avatar.vue';
export { default as Botao } from './componentes/Botao.vue';
export { default as Cabecalho } from './componentes/Cabecalho.vue';
export { default as Campo } from './componentes/Campo.vue';
export { default as Cartao } from './componentes/Cartao.vue';
export { default as Linha } from './componentes/Linha.vue';
export { default as Lista } from './componentes/Lista.vue';
export { default as MenuAcoes } from './componentes/MenuAcoes.vue';
export type { ItemMenu } from './componentes/MenuLista.vue';
export { default as Nota } from './componentes/Nota.vue';
export { default as Numeros } from './componentes/Numeros.vue';
export { default as Recolhivel } from './componentes/Recolhivel.vue';
export { default as Segmentos } from './componentes/Segmentos.vue';
export { default as Seletor } from './componentes/Seletor.vue';
export type { OpcaoSeletor } from './componentes/Seletor.vue';
export { default as Selo } from './componentes/Selo.vue';
export { default as BlurText } from './vuebits/BlurText.vue';
export { default as SplitText } from './vuebits/SplitText.vue';
// O agente montado (com o estilo e o símbolo) fica em 'infoco-ui/agente': importá-lo
// daqui faria toda tela carregar o agente junto.
export { default as AgenteInfoco } from './agente/AgenteInfoco.vue';
export { achatar, anunciar, urlSegura } from './util';
