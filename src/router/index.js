import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'

// 动态导入视图组件
const GeneratorView = () => import('../views/GeneratorView.vue')
const QuickStartView = () => import('../views/QuickStartView.vue')
const HistoryView = () => import('../views/HistoryView.vue')
const HistoryDetailView = () => import('../views/HistoryDetailView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/generator',
    name: 'Generator',
    component: GeneratorView
  },
  {
    path: '/quick-start',
    name: 'QuickStart',
    component: QuickStartView
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryView
  },
  {
    path: '/history/:id',
    name: 'HistoryDetail',
    component: HistoryDetailView
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // 滚动行为：切换路由时滚动到顶部
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
