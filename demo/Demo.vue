<script setup lang="ts">
/** Todo componente do kit e seus estados, numa tela só. Conferir a olho a cada versão, em 390 px e em tela larga. */
import { ref } from 'vue';
import {
  Avatar, BlurText, Botao, Cabecalho, Campo, Cartao, Linha, Lista, MenuAcoes, Nota, Numeros, Recolhivel, Segmentos, Seletor, Selo,
} from '../src/index';

const tipo = ref('todos');
const orgao = ref<string | null>(null);
const busca = ref('');
const ultimaAcao = ref('');
const ORGAOS = [
  { id: 'pref', label: 'Prefeitura Municipal de Itabuna' },
  { id: 'cam', label: 'Câmara Municipal de Itabuna' },
  { id: 'saude', label: 'Fundo Municipal de Saúde', children: [{ id: 'saude-1', label: 'Hospital de Base' }] },
];
</script>

<template>
  <main class="iu pagina">
    <Cartao rotulado-por="t1">
      <Cabecalho id="t1" titulo="Processos do órgão" legenda="Licitações informadas ao TCM e o que já está no acervo.">
        <Botao variante="neutro">Exportar</Botao>
        <Botao variante="azul">Buscar processos</Botao>
      </Cabecalho>

      <Numeros :itens="[{ rotulo: 'Licitações', valor: 128 }, { rotulo: 'No acervo', valor: 41 }, { rotulo: 'Sem arquivo', valor: 7 }]" />

      <div class="filtros">
        <Segmentos v-model="tipo" rotulo="Tipo" :opcoes="[{ id: 'todos', rotulo: 'Todos' }, { id: 'homologado', rotulo: 'Homologadas' }, { id: 'contrato', rotulo: 'Contratos' }]" />
        <Seletor id="orgao" v-model="orgao" rotulo="Órgão" :opcoes="ORGAOS" limpavel pesquisavel placeholder="Todos os órgãos" />
        <Campo id="busca" v-model="busca" rotulo="Filtrar" rotulo-oculto busca placeholder="Objeto, número ou arquivo" />
      </div>

      <Lista>
        <Linha titulo="Aquisição de merenda escolar" detalhe="Pregão eletrônico 012/2026 · abertura 03/03/2026 · R$ 1.240.000,00">
          <Selo tipo="ok" texto="Homologada" />
          <MenuAcoes nome="Pregão 012/2026" :itens="[{ acao: 'ver', texto: 'Ver no TCM' }, { acao: 'puxar', texto: 'Puxar para o acervo' }, { acao: 'x', texto: 'Indisponível', desativado: true }]" @acao="(a) => (ultimaAcao = a)" />
        </Linha>
        <Linha titulo="Locação de veículos" detalhe="Dispensa 004/2026 · R$ 86.000,00">
          <Selo tipo="aviso" texto="Sem arquivo" />
        </Linha>
        <Linha titulo="Serviço de limpeza" detalhe="Concorrência 002/2026">
          <Selo tipo="lendo" texto="Lendo" />
        </Linha>
        <Linha titulo="Obra da praça central" detalhe="Tomada de preços 001/2026">
          <Selo tipo="risco" texto="Falhou" />
          <Botao variante="icone" rotulo="Tentar de novo">↻</Botao>
        </Linha>
        <Linha titulo="Fernando Vitor" detalhe="Administrador">
          <template #inicio><Avatar nome="Fernando Vitor" /></template>
          <Selo tipo="neutro" texto="Ativo" />
        </Linha>
      </Lista>

      <Nota>Última ação do menu: {{ ultimaAcao || 'nenhuma' }}.</Nota>

      <Recolhivel titulo="Filtros · 2 ativos">
        <Nota>O que é raro fica aqui dentro.</Nota>
      </Recolhivel>

      <div class="filtros">
        <Botao variante="azul" carregando>Salvando</Botao>
        <Botao variante="neutro" desativado>Desativado</Botao>
        <Botao variante="discreto">Discreto</Botao>
      </div>
    </Cartao>

    <Cartao>
      <BlurText text="Efeito do Vue Bits na entrada do título" :delay="80" class-name="titulo-efeito" />
    </Cartao>
  </main>
</template>

<style>
body { margin: 0; background: var(--iu-gelo); }
.pagina { max-width: 960px; margin: 0 auto; padding: 24px 16px 120px; display: flex; flex-direction: column; gap: 16px; }
.filtros { display: flex; flex-wrap: wrap; align-items: flex-end; gap: 10px; }
.filtros .iu-seletor { min-width: 240px; flex: 1 1 240px; }
.filtros .iu-campo { flex: 1 1 220px; }
.titulo-efeito { font-size: 21px; font-weight: 600; }
</style>
