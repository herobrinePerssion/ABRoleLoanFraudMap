<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:31:45
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 18:19:51
 * @Description: 
-->
<template>
  <el-container>
  <el-row :gutter="20" style="width: 100%; height: 100vh;">
    <el-col :span="6" :offset="0">
    
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
</script>
