<template>
  <div class="chart-wrapper">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js'
import ChartDataLabels from 'chartjs-plugin-datalabels'
import type { ChartDataModel } from '@/models/ChartData.model'

Chart.register(PieController, ArcElement, Tooltip, Legend, ChartDataLabels)

const model = defineModel<ChartDataModel>({ required: true })

const canvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

onMounted((): void => {
  console.log(model.value);
  
  const ctx = canvas.value?.getContext('2d')
  if (!ctx) return

  chart = new Chart(ctx, {
    type: 'pie',
    data: model.value,
    options: ( {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: false,
        tooltip: {
          enabled: false
        },
        datalabels: {
          color: '#fff',
          anchor: 'center',
          align: 'center',
          font: { weight: '600', size: 12 },
          formatter: (_value: any, ctx: any): any => {
            const label = ctx.chart.data.labels?.[ctx.dataIndex as number]
            return label
          }
        }
      }
    } as any)
  });
});
onBeforeUnmount((): void => {
  if (chart) {
    chart.destroy()
    chart = null
  }
});
</script>

<style scoped>
.chart-wrapper {
  width: 100%;
  max-width: 640px;
  height: 360px;
  margin: 24px auto;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
