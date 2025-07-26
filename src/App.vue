<template>
  <el-container>
    <el-header>
      <FilterPanel />
    </el-header>
    <el-main>
      <MapView />
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import MapView from '@/components/MapView.vue'
import FilterPanel from '@/components/FilterPanel.vue'
</script>
