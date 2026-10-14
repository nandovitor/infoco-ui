/**
 * O pouco de Markdown que a resposta do agente usa (parágrafo, lista, negrito,
 * link) virando estrutura para o template desenhar. Nunca HTML pronto: a
 * resposta repete dado de fonte externa, e `v-html` abriria a porta para ele.
 */
import { urlSegura } from '../util';

export type Trecho =
  | { tipo: 'texto'; texto: string }
  | { tipo: 'negrito'; texto: string }
  | { tipo: 'link'; texto: string; href: string };

export type Bloco =
  | { tipo: 'p'; trechos: Trecho[] }
  | { tipo: 'ul' | 'ol'; itens: Trecho[][] }
  | { tipo: 'titulo'; trechos: Trecho[] };

// [texto](url) · **negrito** · endereço solto
const MARCAS = /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

export const trechos = (linha: string): Trecho[] => {
  const saida: Trecho[] = [];
  let ultimo = 0;
  for (const m of linha.matchAll(MARCAS)) {
    if (m.index > ultimo) saida.push({ tipo: 'texto', texto: linha.slice(ultimo, m.index) });
    if (m[1] !== undefined) {
      const href = urlSegura(m[2]);
      saida.push(href ? { tipo: 'link', texto: m[1], href } : { tipo: 'texto', texto: m[1] });
    } else if (m[3] !== undefined) {
      saida.push({ tipo: 'negrito', texto: m[3] });
    } else {
      const href = urlSegura(m[4]);
      saida.push(href ? { tipo: 'link', texto: m[4]!, href } : { tipo: 'texto', texto: m[4]! });
    }
    ultimo = m.index + m[0].length;
  }
  if (ultimo < linha.length) saida.push({ tipo: 'texto', texto: linha.slice(ultimo) });
  return saida;
};

const ITEM_UL = /^\s*[-*•]\s+(.*)$/;
const ITEM_OL = /^\s*\d+[.)]\s+(.*)$/;
const TITULO = /^\s*#{1,4}\s+(.*)$/;
// Tabela de Markdown não cabe num painel de 400 px: cada linha vira item de lista.
const LINHA_TABELA = /^\s*\|(.*)\|\s*$/;
const SEPARADOR_TABELA = /^\s*\|?[\s:|-]+\|?\s*$/;

export const formatar = (texto: string): Bloco[] => {
  const blocos: Bloco[] = [];
  let paragrafo: string[] = [];
  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push({ tipo: 'p', trechos: trechos(paragrafo.join(' ')) });
    paragrafo = [];
  };
  let cabecalhoDaTabela = true;
  for (const bruta of texto.split('\n')) {
    const tabela = LINHA_TABELA.exec(bruta);
    if (!tabela) cabecalhoDaTabela = true;
    else if (SEPARADOR_TABELA.test(bruta)) continue;
    else if (cabecalhoDaTabela) { cabecalhoDaTabela = false; continue; }
    const linha = tabela ? `- ${tabela[1]!.split('|').map((c) => c.trim()).filter(Boolean).join(' — ')}` : bruta;
    const ul = ITEM_UL.exec(linha);
    const ol = ul ? null : ITEM_OL.exec(linha);
    const titulo = TITULO.exec(linha);
    if (ul || ol) {
      fecharParagrafo();
      const tipo = ul ? 'ul' : 'ol';
      const anterior = blocos[blocos.length - 1];
      const item = trechos((ul ?? ol)![1]!);
      if (anterior && anterior.tipo === tipo) anterior.itens.push(item);
      else blocos.push({ tipo, itens: [item] });
    } else if (titulo) {
      fecharParagrafo();
      blocos.push({ tipo: 'titulo', trechos: trechos(titulo[1]!) });
    } else if (!linha.trim()) {
      fecharParagrafo();
    } else {
      paragrafo.push(linha.trim());
    }
  }
  fecharParagrafo();
  return blocos;
};
