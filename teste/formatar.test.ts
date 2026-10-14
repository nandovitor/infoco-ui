import { describe, expect, it } from 'vitest';
import { formatar, trechos } from '../src/agente/formatar';

describe('formatar a resposta do agente', () => {
  it('negrito, link e endereço solto viram trechos; link que não é http fica texto', () => {
    expect(trechos('**CP-0013/2026** em [ver no PNCP](https://pncp.gov.br/app/editais/1/2026/2) e https://www.tcm.ba.gov.br/x. [mal](javascript:alert(1))')).toEqual([
      { tipo: 'negrito', texto: 'CP-0013/2026' },
      { tipo: 'texto', texto: ' em ' },
      { tipo: 'link', texto: 'ver no PNCP', href: 'https://pncp.gov.br/app/editais/1/2026/2' },
      { tipo: 'texto', texto: ' e ' },
      { tipo: 'link', texto: 'https://www.tcm.ba.gov.br/x', href: 'https://www.tcm.ba.gov.br/x' },
      { tipo: 'texto', texto: '. ' },
      { tipo: 'texto', texto: 'mal' },
      { tipo: 'texto', texto: ')' },
    ]);
  });

  it('parágrafos, listas e título', () => {
    const blocos = formatar('Encontrei 2.\n\n- um\n- dois\n\n1. primeiro\n2. segundo\n## Observações\nfim');
    expect(blocos.map((b) => b.tipo)).toEqual(['p', 'ul', 'ol', 'titulo', 'p']);
    expect(blocos[1]).toMatchObject({ itens: [[{ texto: 'um' }], [{ texto: 'dois' }]] });
  });

  it('tabela vira lista (o painel tem 400 px), sem o cabeçalho', () => {
    const blocos = formatar('| Processo | Valor |\n|---|---|\n| CP-1 | R$ 10 |\n| CP-2 | R$ 20 |\n\nfim');
    expect(blocos[0]).toEqual({ tipo: 'ul', itens: [[{ tipo: 'texto', texto: 'CP-1 — R$ 10' }], [{ tipo: 'texto', texto: 'CP-2 — R$ 20' }]] });
    expect(blocos[1]).toMatchObject({ tipo: 'p' });
  });
});
