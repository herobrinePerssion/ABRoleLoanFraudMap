<template>
  <el-card class="map-card" shadow="hover">
    <div class="map-toolbar">
      <div>
        <div class="map-title">非法助贷公司分布</div>
        <div class="map-subtitle">红色标点为用户举报，蓝色标点为样例风险点</div>
      </div>
      <el-switch
        v-model="heatmapVisible"
        active-text="热力图"
        inactive-text="标点"
        inline-prompt
        @change="syncHeatmap"
      />
    </div>
    <div ref="mapContainerRef" class="map-container"></div>
  </el-card>
</template>

<script setup lang="ts">
import { getAllReportMapPoints, type ReportMapPoint } from '@/services/reportMapService'

declare const AMap: any

const mapContainerRef = ref<HTMLElement>()
const heatmapVisible = ref(true)
const points = ref<ReportMapPoint[]>([])
let mapInstance: any = null
let heatmapInstance: any = null
let markerInstances: any[] = []

function loadAmapScript() {
  if ((window as any).AMap) {
    return new Promise<void>((resolve) => {
      if ((window as any).AMap.HeatMap) {
        resolve()
        return
      }

      ;(window as any).AMap.plugin('AMap.HeatMap', () => resolve())
    })
  }

  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-amap-main-map="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('map load failed')), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://webapi.amap.com/maps?v=2.0&key=7f06493bcc50ca65ec455558e170d017&plugin=AMap.HeatMap'
    script.async = true
    script.dataset.amapMainMap = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('map load failed'))
    document.head.appendChild(script)
  })
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[char]
  })
}

function clearMarkers() {
  markerInstances.forEach(marker => marker.setMap(null))
  markerInstances = []
}

function renderMarkers() {
  if (!mapInstance) return

  clearMarkers()
  points.value.forEach(point => {
    const marker = new AMap.Marker({
      position: [point.lng, point.lat],
      title: point.name,
      icon: point.source === 'report'
        ? 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png'
        : 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
    })

    const info = new AMap.InfoWindow({
      content: `
        <div class="map-info-window">
          <strong>${escapeHtml(point.name)}</strong>
          <p>${escapeHtml(point.city)} | ${escapeHtml(point.status)}</p>
          <p>${escapeHtml(point.address || '暂无地址')}</p>
          <p>${escapeHtml(point.description || '暂无描述')}</p>
        </div>
      `,
      offset: new AMap.Pixel(0, -30),
    })

    marker.on('click', () => {
      info.open(mapInstance, marker.getPosition())
    })

    marker.setMap(mapInstance)
    markerInstances.push(marker)
  })
}

function renderHeatmap() {
  if (!mapInstance || !(window as any).AMap?.HeatMap) return

  const heatData = points.value.map(point => ({
    lng: point.lng,
    lat: point.lat,
    count: point.source === 'report' ? 80 : 45,
  }))

  if (!heatmapInstance) {
    heatmapInstance = new AMap.HeatMap(mapInstance, {
      radius: 28,
      opacity: [0, 0.82],
      gradient: {
        0.35: 'rgb(0, 110, 255)',
        0.6: 'rgb(255, 213, 79)',
        0.85: 'rgb(255, 112, 67)',
        1: 'rgb(216, 27, 96)',
      },
    })
  }

  heatmapInstance.setDataSet({
    data: heatData,
    max: 100,
  })
  syncHeatmap()
}

function syncHeatmap() {
  if (!heatmapInstance) return
  if (heatmapVisible.value) {
    heatmapInstance.show()
  } else {
    heatmapInstance.hide()
  }
}

function locateMap(event: Event) {
  const detail = (event as CustomEvent<{ lng: number; lat: number }>).detail
  if (!mapInstance || !detail) return

  mapInstance.setZoomAndCenter(15, [detail.lng, detail.lat])
}

async function initMap() {
  if (!mapContainerRef.value) return

  try {
    points.value = await getAllReportMapPoints()
    await loadAmapScript()
    mapInstance = new AMap.Map(mapContainerRef.value, {
      zoom: 5,
      center: [104.1954, 35.8617],
    })

    renderMarkers()
    renderHeatmap()
  } catch {
    ElMessage.error('地图加载失败，请稍后重试')
  }
}

onMounted(() => {
  initMap()
  window.addEventListener('map-locate', locateMap)
})

onUnmounted(() => {
  window.removeEventListener('map-locate', locateMap)
  clearMarkers()
  if (mapInstance) {
    mapInstance.destroy()
    mapInstance = null
  }
})
</script>

<style scoped>
.map-card {
  height: 100%;
}

.map-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
}

.map-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.map-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
}

.map-subtitle {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.map-container {
  width: 100%;
  height: calc(100vh - 290px);
  min-height: 360px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:global(.map-info-window) {
  max-width: 260px;
  line-height: 1.5;
  color: #303133;
}

:global(.map-info-window p) {
  margin: 6px 0 0;
}

@media (max-width: 768px) {
  .map-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .map-container {
    height: 420px;
    min-height: 320px;
  }
}
</style>
