# infoco-ui

Kit visual da INFOCO em Vue 3. As cores e o layout vêm do FAQ INFOCO. O comportamento é o dos componentes do SICC, os mesmos da busca avançada do e-TCM. As animações são do Vue Bits. Toda tela segue a "Regra minimalista" do `apple.md`, no Infoco_Sistemas.

Spec: `Infoco_Sistemas/specs/022-kit-vue-agente-infoco`.

## Instalar

Sempre por tag:

```bash
npm i github:nandovitor/infoco-ui#v0.2.0
```

```ts
import 'infoco-ui/estilo.css';
import 'infoco-ui/fonte.css';   // se a página ainda não carrega a Plus Jakarta Sans
import { Cartao, Cabecalho, Numeros, Lista, Linha, Selo, Seletor, MenuAcoes } from 'infoco-ui';
```

| Componente | Para quê |
|---|---|
| `Cartao` | um cartão branco por tela, sem cartão dentro de cartão |
| `Cabecalho` | título de 21 px, uma linha de legenda e as ações |
| `Numeros` | a linha de números que mudam a decisão |
| `Lista` / `Linha` | a lista com hairline: nome em 17 px e detalhe em 14 px |
| `Botao` | variantes `azul` (um por tela), `neutro`, `discreto` e `icone` |
| `Selo` | estados `ok`, `aviso`, `risco`, `neutro` e `lendo`, sempre com ícone e palavra |
| `Seletor` | o seletor em árvore do SICC (`@vitorfba/vue-treeselect`), acessível |
| `MenuAcoes` | o menu "Ações" do SICC, operável pelo teclado |
| `Segmentos` | filtro de tipo em pílulas |
| `Campo` | campo de texto ou de busca |
| `Recolhivel` | `details` nativo, para o que é raro |
| `Nota` | texto em branco-gelo para estados vazios e explicações |
| `Avatar` | foto ou iniciais |
| `BlurText`, `SplitText` | animações do Vue Bits |

## Agente INFOCO

O agente aparece como um símbolo flutuando no canto inferior direito. Ele responde perguntas sobre processos no PNCP, no TCM-BA, no acervo do TCM, na base do TCU, no Transferegov e no DataJud. Ele só consulta, e só para quem tem login. O servidor fica em `POST /api/agente`, no Infoco_Sistemas.

**Em app com Vite** (sistema interno, apps em Vue):

```ts
import { montarAgente } from 'infoco-ui/agente';
const tirar = montarAgente({ endpoint: '/api/agente', entrar: '/' });
```

O agente aceita estas opções:

| Opção | O que faz |
|---|---|
| `exemplos` | até 4 perguntas de exemplo |
| `descricao` | a linha do painel vazio |
| `contexto` | função que devolve `{ secao, trecho }` da página |
| `voz` | `{ endpoint: '/api/ia/voz', uilber: true }`: leitura automática da resposta e o botão "Ouvir na voz do Uilber" |

O controle devolvido tem `abrir(texto?)`, `fechar()`, `perguntar(texto)`, `comTrecho(trecho, secao?)` e `tirar()`. A cada pergunta, a janela recebe o evento `agente-infoco:pergunta` (`{caracteres, comTrecho}`) para medir o uso.

Se a tela tem uma ação no canto inferior direito, como o "Enviar" de um chat, ela sobe o botão do agente com `--iu-agente-baixo`, por exemplo `document.documentElement.style.setProperty('--iu-agente-baixo', '84px')`.

**Em página sem build** (FAQ, Documentos para o TCM): copie `dist/agente.js` e `dist/agente.css` para a página.

```html
<link rel="stylesheet" href="/assets/agente.css">
<script>window.agenteInfocoOpcoes = { exemplos: ['…'], voz: { endpoint: '/api/ia/voz', uilber: true } };</script>
<script src="/assets/agente.js" defer data-endpoint="/api/agente"
        data-simbolo="/assets/logo-simbolo.png" data-entrar="/login"></script>
```

Na página sem build, o contexto vem de `window.__iaContexto()` quando ela o define. O controle fica em `window.agenteInfoco` e também em `window.infocoIA`, o nome da Infoco I.A que o agente substituiu no FAQ.

## Desenvolver

```bash
npm install
npm run dev     # página de demonstração; /api é encaminhado ao sistema interno (porta 3000)
npm test        # formatador da resposta do agente
npm run build   # confere os tipos e gera dist/agente.js e dist/agente.css (o dist vai para o git)
```

**Nova versão:**

1. Mude `version` no `package.json`.
2. Rode `npm run build`.
3. Faça o commit, crie a tag `vX.Y.Z` e mande para o GitHub.
4. Em cada sistema, atualize a tag na dependência.
