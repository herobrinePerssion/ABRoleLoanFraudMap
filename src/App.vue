<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 23:35:55
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 23:58:14
 * @Description: 
-->
<template>
  <el-container class="el-container">
  <el-row :gutter="20" style="width: 100%; height: 100%;">
    <el-col :span="6" :offset="0">
    <VictimList></VictimList>
    </el-col>
    <el-col :span="18" :offset="0">
      <el-header>
        <FilterPanel />
      </el-header>
      <el-main style="padding: 10px;">
        <MapView />
      </el-main>
    </el-col>
  </el-row>
  
    
  </el-container>
</template>

<script setup lang="ts">
import MapView from '@/components/MapView.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import VictimList from '@/components/VictimList.vue'
</script>
<style lang="scss" scoped>
.el-container {
  overflow: hidden !important;
}
</style>
