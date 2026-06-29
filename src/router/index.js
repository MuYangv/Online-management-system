import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { title: '数据概览' }
  },
  {
    path: '/students',
    name: 'StudentList',
    component: () => import('../views/StudentList.vue'),
    meta: { title: '学生列表' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
