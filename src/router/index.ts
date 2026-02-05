// 路由配置
// Route configuration
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useConnectionStore } from '@/stores/connection'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      title: '数据管理',
      requiresAuth: true
    }
  }
]

// 使用环境变量设置 base 路径，与 Vite 配置保持一致
// Use environment variable to set base path, consistent with Vite configuration
const base = import.meta.env.BASE_URL

const router = createRouter({
  history: createWebHistory(base),
  routes
})

// 路由守卫
// Route guard
router.beforeEach((to, _from, next) => {
  const connectionStore = useConnectionStore()

  // 设置页面标题
  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - Qubist` : 'Qubist'

  // 检查是否需要认证
  // Check if authentication is required
  if (to.meta.requiresAuth && !connectionStore.isConnected) {
    next('/login')
  } else if (to.path === '/login' && connectionStore.isConnected) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
