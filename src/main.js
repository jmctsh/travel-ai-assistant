// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'font-awesome/css/font-awesome.min.css'
import './assets/main.css'

createApp(App)
  .use(router)
  .mount('#app')