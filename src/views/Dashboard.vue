<template>
  <div class="dashboard">
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-value" style="color: var(--color-primary)">{{ store.totalStudents }}</div>
        <div class="stat-label">学生总数</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--color-success)">{{ store.avgScore }}</div>
        <div class="stat-label">平均成绩</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--color-warning)">{{ store.maxScore }}</div>
        <div class="stat-label">最高分</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--color-danger)">{{ store.minScore }}</div>
        <div class="stat-label">最低分</div>
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <h4 style="margin-bottom: 16px; font-size: 14px;">成绩分布</h4>
        <v-chart :option="scoreChartOption" style="height: 300px" autoresize />
      </div>
      <div class="card">
        <h4 style="margin-bottom: 16px; font-size: 14px;">性别比例</h4>
        <v-chart :option="genderChartOption" style="height: 300px" autoresize />
      </div>
    </div>

    <div class="charts-row">
      <div class="card">
        <h4 style="margin-bottom: 16px; font-size: 14px;">各年级人数</h4>
        <v-chart :option="gradeChartOption" style="height: 280px" autoresize />
      </div>
      <div class="card">
        <h4 style="margin-bottom: 16px; font-size: 14px;">专业分布</h4>
        <v-chart :option="majorChartOption" style="height: 280px" autoresize />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { useStudentStore } from '../stores/student'

use([BarChart, PieChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, CanvasRenderer])

const store = useStudentStore()

const scoreChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: store.scoreDistribution.map(d => d.name) },
  yAxis: { type: 'value', minInterval: 1 },
  series: [{
    name: '人数',
    type: 'bar',
    data: store.scoreDistribution.map(d => d.value),
    itemStyle: {
      color: (params) => {
        const colors = ['#4f6ef7', '#6c8cff', '#f39c12', '#f7b731', '#e74c3c']
        return colors[params.dataIndex] || colors[0]
      }
    },
    barWidth: '50%'
  }]
}))

const genderChartOption = computed(() => ({
  tooltip: { trigger: 'item' },
  legend: { bottom: 0 },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['50%', '45%'],
    label: { formatter: '{b}\n{d}%' },
    data: store.genderDistribution,
    itemStyle: {
      color: (params) => params.name === '男' ? '#4f6ef7' : '#f06292'
    }
  }]
}))

const gradeChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', data: store.gradeDistribution.map(d => d.name) },
  yAxis: { type: 'value', minInterval: 1 },
  series: [{
    name: '人数',
    type: 'bar',
    data: store.gradeDistribution.map(d => d.value),
    itemStyle: { color: '#4f6ef7', borderRadius: [4, 4, 0, 0] },
    barWidth: '45%'
  }]
}))

const majorChartOption = computed(() => ({
  tooltip: { trigger: 'item', formatter: '{b}: {c}人 ({d}%)' },
  series: [{
    type: 'pie',
    radius: '65%',
    center: ['50%', '50%'],
    label: { formatter: '{b}\n{d}%', fontSize: 11 },
    data: store.majorDistribution
  }]
}))
</script>
