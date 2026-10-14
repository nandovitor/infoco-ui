/**
 * A voz do agente, como a Infoco I.A do FAQ já fazia (index.html, 2426-2614):
 * a resposta pronta é lida em voz alta pelo servidor de voz da página
 * (`POST {texto, voz?}` → áudio); se ele falhar ou o navegador barrar o som
 * automático, cai na voz pt-BR do próprio navegador. Uma fala por vez: a nova
 * cala a anterior, e áudio que chega atrasado não toca por cima.
 */
import { ref } from 'vue';

export interface OpcoesVoz {
  /** O servidor de voz: `/api/ia/voz` no FAQ. */
  endpoint: string;
  /** Mostra "Ouvir na voz do Uilber" embaixo de cada resposta. */
  uilber?: boolean;
}

/** Texto para falar: sem marcação, sem endereço, sem o sinal das listas. */
export const paraFala = (texto: string) =>
  texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\*\*|__|`|#+\s/g, '')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+\n/g, '\n')
    .trim()
    .slice(0, 4000);

export const usarVoz = (opcoes?: OpcoesVoz) => {
  const falando = ref<number | null>(null);   // id da mensagem que está tocando
  const carregando = ref<number | null>(null);
  let audio: HTMLAudioElement | null = null;
  let vez = 0;

  const calar = () => {
    vez++;
    audio?.pause();
    audio = null;
    try { window.speechSynthesis?.cancel(); } catch { /* sem voz no navegador */ }
    falando.value = null;
    carregando.value = null;
  };

  const peloNavegador = (texto: string, id: number, minha: number) => {
    const sintese = window.speechSynthesis;
    if (!sintese || minha !== vez) { falando.value = null; return; }
    const fala = new SpeechSynthesisUtterance(texto);
    fala.lang = 'pt-BR';
    fala.rate = 1.02;
    fala.onend = fala.onerror = () => { if (minha === vez) falando.value = null; };
    falando.value = id;
    sintese.speak(fala);
  };

  /** Fala o texto da mensagem `id`. `voz: 'uilber'` usa a voz clonada; sem ela, a padrão do servidor. */
  const falar = async (id: number, texto: string, voz?: 'uilber') => {
    if (!opcoes) return;
    calar();
    const minha = vez;
    const limpo = paraFala(texto);
    if (!limpo) return;
    carregando.value = id;
    try {
      const r = await fetch(opcoes.endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(voz ? { texto: limpo, voz } : { texto: limpo }),
      });
      if (!r.ok) throw new Error(`voz ${r.status}`);
      const url = URL.createObjectURL(await r.blob());
      if (minha !== vez) { URL.revokeObjectURL(url); return; }
      audio = new Audio(url);
      audio.onended = audio.onerror = () => { URL.revokeObjectURL(url); if (minha === vez) falando.value = null; };
      carregando.value = null;
      falando.value = id;
      await audio.play();
    } catch {
      carregando.value = null;
      // A voz do Uilber não tem reserva: se ela falhou, quem pediu vê o botão voltar.
      if (minha === vez && !voz) peloNavegador(limpo, id, minha);
      else if (minha === vez) falando.value = null;
    }
  };

  return { falando, carregando, falar, calar };
};
