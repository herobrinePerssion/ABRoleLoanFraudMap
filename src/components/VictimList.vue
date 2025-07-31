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
  { name: '赵六', city:'上海', amount: 15000, location: { lng: 121.47, lat: 31.23 } },
  { name: '孙七', city:'广州', amount: 30000, location: { lng: 113.26, lat: 23.13 } },
  { name: '周八', city:'深圳', amount: 40000, location: { lng: 114.05, lat: 22.55 } },
  { name: '吴九', city:'杭州', amount: 25000, location: { lng: 120.19, lat: 30.26 } },
  { name: '郑十', city:'成都', amount: 60000, location: { lng: 104.06, lat: 30.67 } },
  { name: '钱十一', city:'武汉', amount: 45000, location: { lng: 114.31, lat: 30.52 } },
  { name: '孙十二', city:'西安', amount: 70000, location: { lng: 108.95, lat: 34.27 } },
  { name: '李十三', city:'重庆', amount: 80000, location: { lng: 106.55, lat: 29.57 } },
  { name: '王十四', city:'天津', amount: 90000, location: { lng: 117.20, lat: 39.12 } },
  { name: '赵十五', city:'南京', amount: 100000, location: { lng: 118.78, lat: 32.04 } },
  { name: '张十六', city:'苏州', amount: 120000, location: { lng: 120.62, lat: 31.32 } },
  { name: '李十七', city:'青岛', amount: 110000, location: { lng: 120.38, lat: 36.07 } },
  { name: '王十八', city:'厦门', amount: 130000, location: { lng: 118.08, lat: 24.48 } },
  { name: '赵十九', city:'长沙', amount: 140000, location: { lng: 112.98, lat: 28.21 } },
  { name: '孙二十', city:'郑州', amount: 160000, location: { lng: 113.65, lat: 34.76 } },
  { name: '周二十一', city:'合肥', amount: 170000, location: { lng: 117.27, lat: 31.86 } },
  { name: '吴二十二', city:'哈尔滨', amount: 180000, location: { lng: 126.63, lat: 45.75 } },
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
