import { createApp } from 'vue'
import App from './App.vue'
import ZList from './components/ZList';

const app = createApp(App);

app.component('z-list', ZList);

app.mount('#app');
