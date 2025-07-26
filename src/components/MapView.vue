<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import data from '../../data/fraud_list.json'

const mapContainer = ref(null)

onMounted(() => {
  mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'
  const map = new mapboxgl.Map({
    container: mapContainer.value as HTMLElement,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [104.1954, 35.8617],
    zoom: 4
  })

  data.forEach(item => {
    new mapboxgl.Marker()
      .setLngLat([item.lng, item.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${item.name}</strong><br>${item.city}<br>${item.description}`))
      .addTo(map)
  })
})
</script>

<style>
.map-container {
  width: 100%;
  height: 100vh;
}
</style>
