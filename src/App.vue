<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 23:35:55
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 23:58:14
 * @Description: 
-->
<template>
  <el-container class="el-container">
  <Header  />
  <el-row :gutter="20" class="main-content">
    <el-col :span="6" :offset="0">
    <VictimList class="victim-list"></VictimList>
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
import Header from '@/components/Header.vue'
</script>
<style lang="scss" scoped>
.el-container {
  overflow: hidden !important;
  flex-direction: column;
  .victim-list {
    height: calc(100vh - 110px); // Adjust height to account for header
    overflow-y: auto;
  }
  .main-content {
    height: calc(100vh - 100px); // Adjust height to account for header
    overflow: hidden;
  }
}
</style>
