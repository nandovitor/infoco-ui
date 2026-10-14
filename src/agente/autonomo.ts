/**
 * O agente para páginas sem Vue nem build (FAQ e Documentos para o TCM): o
 * `dist/agente.js` se monta sozinho a partir dos atributos da própria tag.
 *
 *   <link rel="stylesheet" href="/assets/agente.css">
 *   <script src="/assets/agente.js" defer
 *           data-endpoint="/api/agente" data-simbolo="/assets/logo-simbolo.png" data-entrar="/login"></script>
 *
 * O símbolo entra por endereço, nunca embutido: há páginas cuja política de
 * segurança não aceita `data:`.
 */
import '../estilo/estilo.css';
import { montarAgenteCom } from './montagem';

const tag = document.currentScript as HTMLScriptElement | null;
const dados = tag?.dataset ?? {};

const montar = () => montarAgenteCom({
  endpoint: dados.endpoint || '/api/agente',
  simbolo: dados.simbolo || '/assets/logo-simbolo.png',
  entrar: dados.entrar || '/login',
});

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar, { once: true });
else montar();
