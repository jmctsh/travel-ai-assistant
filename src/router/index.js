// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import ChatBox from '../components/ChatBox.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatBox
  },
  {
    path: '/admin',
    name: 'Admin',
    beforeEnter() {
      window.location.href = '/admin.html'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router