<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Home"></page-title>
    <v-chart ref="chartRef" class="chart mt-4" :option="option" autoresize />
  </div>
</template>

<script setup>
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart } from 'echarts/charts'
import { TitleComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

use([CanvasRenderer, PieChart, TitleComponent, TooltipComponent, LegendComponent])

// Get current theme from store
const { theme } = storeToRefs(useBaseStore())

// Reference to the chart instance
const chartRef = ref(null)

// Handle resizing
const handleResize = () => {
  if (chartRef.value) {
    chartRef.value.resize()
  }
}

// Set up resize handlers
onMounted(() => {
  window.addEventListener('resize', handleResize)

  // Also trigger resize when sidebar opens/closes or layout changes
  setTimeout(() => {
    handleResize()
  }, 200)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Create a reactive chart option that updates with theme changes
const option = computed(() => {
  // Get current text color based on theme
  const currentTextColor = theme.value === 'light' ? '#000000' : '#FFFFFF'

  return {
    title: {
      text: 'Traffic Sources',
      left: 'right',
      textStyle: {
        color: currentTextColor,
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['Direct', 'Email', 'Ad Networks', 'Video Ads', 'Search Engines'],
      textStyle: {
        color: currentTextColor,
      },
    },
    series: [
      {
        name: 'Traffic Sources',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        data: [
          {
            value: 335,
            name: 'Direct',
          },
          {
            value: 310,
            name: 'Email',
          },
          {
            value: 234,
            name: 'Ad Networks',
          },
          {
            value: 135,
            name: 'Video Ads',
          },
          {
            value: 1548,
            name: 'Search Engines',
          },
        ],

        label: {
          show: true,
          formatter: '{b}: {d}%',
          color: currentTextColor,
        },
      },
    ],
    backgroundColor: 'transparent',
  }
})
</script>

<style scoped>
.chart {
  flex-grow: 1;
}
</style>
