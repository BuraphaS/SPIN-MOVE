<template>
  <div class="container">
    <div class="chart-wrapper" ref="wrapper">
      <div class="spin-area" ref="chartRef">
        <div class="pointer">▼</div>
        <PieChart
          ref="chartRef"
          :key="chartKey"
          :style="wrapperStyle"
          v-model="chartData"/>
      </div>
    </div>
    <button type="button" class="spin-btn" @click="spin()">Start</button>
    <div class="input-container">
      <input
        v-model="input"
        type="text"
        placeholder="Input your word"
        style="height: 30px; border-radius: 4px;"
        @keyup.enter="addText()"/>
      <button type="button" class="add-btn" @click="addText()">Add</button>
    </div>
    <div class="table">
      <table>
        <tr>
          <th>Words</th>
        </tr>
        <tr v-for="(item, index) in chartData.labels" :key="index">
          <td
            :style="lastResult === item ? 'background-color: green  ; color: white;' : ''"
            style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              {{ item }}
            </div>
            <div 
              :style="lastResult === item ? 'color: white;' : ''"
              class="delete-btn" @click="deleteText(index)">
              x
            </div>
          </td>
        </tr>
      </table>
    </div>
    <div style="margin-top: 16px; font-weight: 400; font-size: 24px;">
      Winner: {{ `${lastResult }` || '?'}}
    </div>
  </div>
</template>

<script setup lang="ts">
import PieChart from '../components/PieChart.vue'
import type { ChartDataModel } from '@/models/ChartData.model'

const spining = ref<boolean>(false)
const finalDeg = ref<number>(0)
const lastResult = ref<string>('')
const input = ref<string>('')
const chartKey = ref<number>(0)

const chartData = ref<ChartDataModel>({
  labels: ['Dog', 'Cat'],
  datasets: [
    {
      data: [1,1],
      backgroundColor: [
        'rgba(255, 99, 132, 0.7)',
        'rgba(54, 162, 235, 0.7)'
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)'
      ],
      borderWidth: 1
    }
  ]
},)
const wrapperStyle = ref<any>({
  display: 'inline-block',
  position: 'relative',
  width: '100%',
  maxWidth: '640px',
  height: '360px',
  transform: 'rotate(0deg)'
})

function randomColor() {
  const r = Math.floor(Math.random()*255)
  const g = Math.floor(Math.random()*255)
  const b = Math.floor(Math.random()*255)
  return `rgba(${r},${g},${b},0.7)`
}

function addText(): void {
  if (!input.value.trim()) return
  const color = randomColor()

  const newLabels = [...(chartData.value.labels ?? []), input.value]
  const newData = [...(chartData.value.datasets[0]?.data ?? []), 1]
  const bg = [...(chartData.value.datasets[0]?.backgroundColor ?? []), color]
  const border = [...(chartData.value.datasets[0]?.borderColor ?? []), (bg[bg.length-1]?.replace('0.7','1') ?? '')]

  chartData.value = {
    labels: newLabels,
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: newData,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: chartData.value.datasets[0]?.borderWidth ?? 1
      }
    ]
  }
  input.value = ''
  chartKey.value += 1
}
function deleteText(index: number): void {
  const newLabels = [...(chartData.value.labels ?? [])]
  newLabels.splice(index, 1)
  const newData = [...(chartData.value.datasets[0]?.data ?? [])]
  newData.splice(index, 1)
  const bg = [...(chartData.value.datasets[0]?.backgroundColor ?? [])]
  bg.splice(index, 1)
  const border = [...(chartData.value.datasets[0]?.borderColor ?? [])]
  border.splice(index, 1)

  chartData.value = {
    labels: newLabels,
    datasets: [
      {
        ...chartData.value.datasets[0],
        data: newData,
        backgroundColor: bg,
        borderColor: border,
        borderWidth: chartData.value.datasets[0]?.borderWidth ?? 1
      }
    ]
  }
  chartKey.value += 1
}
function getSegments  (data: number[]): number[] {
  const total = data.reduce((sum, val) => sum + val, 0);
  return data.map(value => (value / total) * 360);
}

function getResultByDegree(finalRotation: number) {
  const normalizedRotation = ((finalRotation % 360) + 360) % 360;

  const angleAtTop = (360 - normalizedRotation) % 360;

  const dataArr = chartData.value.datasets?.[0]?.data;
  if (!dataArr) {
    return { index: 0, label: chartData.value.labels[0] ?? '#0', value: 0 };
  }
  const segments = getSegments(dataArr) ?? [];
  let angleAcc = 0;
  for (let i = 0; i < segments.length; i++) {
    const start = angleAcc;
    angleAcc += segments[i] ?? 0;
    const end = angleAcc;
    if (angleAtTop >= start && angleAtTop < end) {
      return { index: i, label: chartData.value.labels[i] ?? `#${i}`, value: dataArr[i] ?? 0 };
    }
  }
  const last = chartData.value.labels.length - 1;
  return { index: last, label: chartData.value.labels[last] ?? `#${last}`, value: dataArr[last] ?? 0 };
}

function spin (): void {
  if (spining.value) return
  spining.value = true
  stepSpin()
}

function stepSpin(): void {
  spining.value = true

  const start = performance.now()
  const totalRotations = 20
  const randomDeg = Math.random() * 360
  finalDeg.value = totalRotations * 360 + randomDeg
  const duration = 7000
  const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3)

  const animate = (now: number): void => {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)

    const eased = easeOutCubic(progress)
    const currentDeg = finalDeg.value * eased

    wrapperStyle.value.transform = `rotate(${currentDeg}deg)`

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      spining.value = false
      const normalized = ((finalDeg.value % 360) + 360) % 360;
      wrapperStyle.value.transform = `rotate(${normalized}deg)`
      finalDeg.value = normalized
      const result = getResultByDegree(normalized);
      lastResult.value = result.label
    }
  }
  requestAnimationFrame(animate)
}
</script>

<style scoped lang="css">
.container {
  text-align: center;
}
.chart-wrapper {
  width: 100%;
  max-width: 640px;
  margin: 24px auto;
  text-align: center;
  overflow: hidden;
}
.spin-area {
  display: inline-block;
  position: relative;
  width: 100%;
  max-width: 640px;
  height: 360px;
  transform-origin: 50% 50%;
} 
.pointer {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 10px;
  font-size: 28px;
  pointer-events: none;
  z-index: 100;
}
.spin-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #111827;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.add-btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background: #111827;
  color: white;
  font-weight: 600;
  cursor: pointer;
}
.delete-btn {
  border: none;
  color: black;
  cursor: pointer;
}
.input-container {
  margin: 24px 0px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

table {
  font-family: arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #000000;
  background-color: #ffffff;
  text-align: left;
  padding: 8px;
}
</style>