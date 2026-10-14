import { createApp } from 'vue';
import '../src/estilo/fonte.css';
import '../src/estilo/estilo.css';
import { montarAgente } from '../src/agente/montar';
import Demo from './Demo.vue';

createApp(Demo).mount('#app');
montarAgente({ endpoint: '/api/agente' });
