// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // 引入我们创建的路由
import 'font-awesome/css/font-awesome.min.css'
import './assets/main.css'

const app = createApp(App)

app.use(router) // 使用路由

app.mount('#app')
