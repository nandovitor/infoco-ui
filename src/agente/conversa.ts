/**
 * A conversa com o Agente INFOCO: envia a pergunta, lê a resposta em
 * andamento (text/event-stream num POST) e guarda tudo só na aba
 * (sessionStorage). Fechou a aba, a conversa some — nada fica no servidor.
 *
 * Eventos do servidor (api/agente.ts no Infoco_Sistemas):
 *   status {texto}          o que está sendo consultado agora
 *   texto  {t}              mais um pedaço da resposta
 *   fim    {fontes}         fontes consultadas, com link quando há
 *   erro   {mensagem}       a resposta parou
 */
import { reactive, watch } from 'vue';

export interface Fonte { rotulo: string; url?: string }
export interface Mensagem {
  id: number;
  papel: 'pessoa' | 'agente';
  texto: string;
  fontes?: Fonte[];
  erro?: string;
}

export type Situacao = 'livre' | 'enviando' | 'sessao' | 'limite';

const CHAVE = 'infoco-agente:conversa';
const HISTORICO = 10;          // mensagens enviadas como contexto
const MAX_TEXTO = 4000;

const lerGuardada = (): Mensagem[] => {
  try {
    const bruto = JSON.parse(sessionStorage.getItem(CHAVE) || '[]');
    return Array.isArray(bruto) ? bruto.filter((m) => m && typeof m.texto === 'string') : [];
  } catch {
    return [];
  }
};

/** Os blocos `event:`/`data:` de um text/event-stream que chegam aos pedaços. */
export const lerEventos = async (
  corpo: ReadableStream<Uint8Array>,
  aoEvento: (evento: string, dados: any) => void,
) => {
  const leitor = corpo.getReader();
  const decodificador = new TextDecoder();
  let resto = '';
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    resto += decodificador.decode(value, { stream: true });
    let fim: number;
    while ((fim = resto.indexOf('\n\n')) >= 0) {
      const bloco = resto.slice(0, fim);
      resto = resto.slice(fim + 2);
      let evento = 'message';
      const dados: string[] = [];
      for (const linha of bloco.split('\n')) {
        if (linha.startsWith('event:')) evento = linha.slice(6).trim();
        else if (linha.startsWith('data:')) dados.push(linha.slice(5).trimStart());
      }
      if (!dados.length) continue;
      try { aoEvento(evento, JSON.parse(dados.join('\n'))); } catch { /* bloco fora do formato: ignora */ }
    }
  }
};

export const usarConversa = (endpoint: string) => {
  const estado = reactive({
    mensagens: lerGuardada() as Mensagem[],
    situacao: 'livre' as Situacao,
    consultando: '',
    aviso: '',
  });
  let controle: AbortController | null = null;
  let proximoId = Math.max(0, ...estado.mensagens.map((m) => m.id)) + 1;

  watch(() => estado.mensagens, (lista) => {
    try { sessionStorage.setItem(CHAVE, JSON.stringify(lista)); } catch { /* aba sem armazenamento: segue sem guardar */ }
  }, { deep: true });

  const enviar = async (pergunta: string) => {
    const texto = pergunta.trim().slice(0, MAX_TEXTO);
    if (!texto || estado.situacao === 'enviando') return;
    estado.aviso = '';
    estado.mensagens.push({ id: proximoId++, papel: 'pessoa', texto });
    const resposta: Mensagem = reactive({ id: proximoId++, papel: 'agente', texto: '' });
    const historico = estado.mensagens
      .filter((m) => !m.erro && m.texto)
      .slice(-HISTORICO)
      .map((m) => ({ papel: m.papel, texto: m.texto.slice(0, MAX_TEXTO) }));
    estado.mensagens.push(resposta);
    estado.situacao = 'enviando';
    estado.consultando = '';
    controle = new AbortController();

    try {
      const r = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
        body: JSON.stringify({ mensagens: historico }),
        signal: controle.signal,
      });
      if (r.status === 401) {
        estado.mensagens.splice(estado.mensagens.indexOf(resposta), 1);
        estado.situacao = 'sessao';
        return;
      }
      if (!r.ok || !r.body) {
        const corpo = await r.json().catch(() => ({}));
        estado.mensagens.splice(estado.mensagens.indexOf(resposta), 1);
        estado.aviso = corpo?.mensagem || 'O agente não está disponível agora. Tente novamente em instantes.';
        estado.situacao = r.status === 429 ? 'limite' : 'livre';
        return;
      }
      await lerEventos(r.body, (evento, dados) => {
        if (evento === 'status') estado.consultando = String(dados?.texto || '');
        else if (evento === 'texto') { resposta.texto += String(dados?.t || ''); estado.consultando = ''; }
        else if (evento === 'fim') resposta.fontes = Array.isArray(dados?.fontes) ? dados.fontes : [];
        else if (evento === 'erro') resposta.erro = String(dados?.mensagem || 'A resposta foi interrompida. Tente novamente.');
      });
      if (!resposta.texto && !resposta.erro) resposta.erro = 'A resposta veio vazia. Tente novamente.';
    } catch (e) {
      resposta.erro = (e as Error)?.name === 'AbortError'
        ? 'Resposta interrompida.'
        : 'A conexão caiu durante a resposta. Tente novamente.';
    } finally {
      controle = null;
      estado.consultando = '';
      if (estado.situacao === 'enviando') estado.situacao = 'livre';
    }
  };

  /** Repete a última pergunta: tira a resposta com erro e a pergunta, e manda de novo. */
  const repetir = () => {
    const iPergunta = estado.mensagens.map((m) => m.papel).lastIndexOf('pessoa');
    if (iPergunta < 0) return;
    const pergunta = estado.mensagens[iPergunta]!.texto;
    estado.mensagens.splice(iPergunta);
    void enviar(pergunta);
  };

  const parar = () => controle?.abort();

  const nova = () => {
    parar();
    estado.mensagens.splice(0);
    estado.aviso = '';
    if (estado.situacao !== 'sessao') estado.situacao = 'livre';
  };

  return { estado, enviar, repetir, parar, nova };
};
