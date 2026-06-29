<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="logo">📚 学生管理</div>
      <nav>
        <router-link to="/dashboard">
          <span class="nav-icon">📊</span>
          <span>数据概览</span>
        </router-link>
        <router-link to="/students">
          <span class="nav-icon">👥</span>
          <span>学生列表</span>
        </router-link>
      </nav>
    </aside>
    <main class="main-content">
      <header class="topbar">
        <h2>{{ pageTitle }}</h2>
      </header>
      <div class="page">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const pageTitle = computed(() => {
  return route.meta.title || '学生管理系统'
})
</script>
