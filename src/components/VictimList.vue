<!-- src/components/VictimList.vue -->
<template>
  <el-card header="举报列表" class="victim-list-card">
    <div class="scroll-wrapper" ref="scrollContainer" @mouseenter="pauseScroll" @mouseleave="startScroll">
      <ul class="scroll-list"  v-infinite-scroll="load" style="overflow: auto" >
        <li v-for="(item, index) in victims" :key="index" class="scroll-item" @click="handleClick(item)">
          <span class="name">{{ item.name }}</span>
          <span class="city">{{ item.city }}</span>
          <span class="amount">¥{{ item.amount.toLocaleString() }}</span>
        </li>
      </ul>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Victim {
  name: string
  amount: number
  city?: string
  location: { lng: number; lat: number }
}

const victims = ref<Victim[]>([
  { name: '张三', city:'北京', amount: 20000, location: { lng: 121.47, lat: 31.23 } },
  { name: '李四', city:'北京', amount: 35000, location: { lng: 113.26, lat: 23.13 } },
  { name: '王五', city:'北京', amount: 50000, location: { lng: 118.78, lat: 32.04 } },
  // 可以继续添加数据
])

const scrollContainer = ref<HTMLDivElement | null>(null)
let timer: number | undefined

const startScroll = () => {
  timer = window.setInterval(() => {
    const container = scrollContainer.value
    if (container) {
      container.scrollTop += 1
      if (container.scrollTop >= container.scrollHeight - container.clientHeight) {
        container.scrollTop = 0 // 无缝滚动
      }
    }
  }, 30)
}

const pauseScroll = () => {
  clearInterval(timer)
}

const handleClick = (victim: Victim) => {
  // 向外发射事件，定位到地图上
  window.dispatchEvent(new CustomEvent('map-locate', { detail: victim.location }))
}
const load = () => {
  
}
onMounted(startScroll)
onUnmounted(pauseScroll)
</script>

<style scoped>
.victim-list-card {
  height: calc(100vh - 60px);
  overflow: hidden;
}

.scroll-wrapper {
  height: calc(100vh - 60px);
  overflow: hidden;
  position: relative;
}

.scroll-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scroll-item {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  transition: background-color 0.2s;
}

.scroll-item:hover {
  background-color: #f5f7fa;
}

.name {
  font-weight: 600;
  color: #303133;
}

.amount {
  color: #f56c6c;
  font-weight: bold;
}
</style>
