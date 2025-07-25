import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  }
]

// 安全措施：只在开发模式下添加/admin路由
// 当运行 `npm run build` 时，这段代码和它引用的AdminView组件将被彻底移除
if (import.meta.env.DEV) {
  routes.push({
    path: '/admin',
    name: 'admin',
    // 使用动态导入，确保AdminView只在需要时被加载
    component: () => import('../views/AdminView.vue')
  })
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
