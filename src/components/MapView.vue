<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:32:24
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 18:14:12
 * @Description: 
-->
<template>
  <el-card class="map-card" shadow="hover">
    <div id="mapContainer" class="map-container"></div>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import data from '../../data/fraud_list.json'
import 'element-plus/theme-chalk/el-alert.css'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://webapi.amap.com/maps?v=2.0&key=7f06493bcc50ca65ec455558e170d017'
  script.onload = () => {
    const map = new AMap.Map('mapContainer', {
      zoom: 5,
      center: [104.1954, 35.8617],
    })

    data.forEach((item) => {
      const marker = new AMap.Marker({
        position: [item.lng, item.lat],
        title: item.name,
      })

      const info = new AMap.InfoWindow({
        content: `<strong>${item.name}</strong><br>${item.city}<br>${item.description}`,
        offset: new AMap.Pixel(0, -30),
      })

      marker.on('click', () => {
        info.open(map, marker.getPosition())
      })

      map.add(marker)
    })
  }
  document.head.appendChild(script)
})
</script>

<style>
.map-container {
  width: 100%;
  height: calc(100vh - 220px); /* Adjust height to fit the header */
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.mb-2 {
  margin-bottom: 16px;
}
</style>
