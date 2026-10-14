/** Sem acento e em minúsculas: "Câmara" e "camara" se acham na busca. */
export const achatar = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Só http e https viram link: o endereço vem de fora, não se confia no formato. */
export const urlSegura = (u: unknown): string | null => {
  try {
    const url = new URL(String(u ?? ''));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
};

let regiao: HTMLElement | null = null;
let vez = 0;

/** Fala para o leitor de tela sem mexer no que está na tela (uma região aria-live só, criada na primeira vez). */
export const anunciar = (texto: string) => {
  if (typeof document === 'undefined') return;
  if (!regiao) {
    regiao = document.createElement('p');
    regiao.className = 'iu-so-leitor';
    regiao.setAttribute('aria-live', 'polite');
    document.body.append(regiao);
  }
  const minha = ++vez;
  regiao.textContent = '';
  setTimeout(() => { if (minha === vez && regiao) regiao.textContent = texto; }, 60);
};
