<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:40:57
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 17:41:00
 * @Description: 
-->
<template>
  <el-form :inline="true" :model="filters" class="filter-form">
    <el-form-item label="城市">
      <el-select v-model="filters.city" placeholder="选择城市" clearable>
        <el-option v-for="city in cityList" :key="city" :label="city" :value="city" />
      </el-select>
    </el-form-item>
    <el-form-item label="状态">
      <el-select v-model="filters.status" placeholder="选择状态" clearable>
        <el-option label="未立案" value="未立案" />
        <el-option label="立案中" value="立案中" />
        <el-option label="已判决" value="已判决" />
      </el-select>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="applyFilter">筛选</el-button>
      <el-button @click="resetFilter">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const filters = reactive({
  city: '',
  status: ''
})

const cityList = ['深圳市', '广州市', '北京市', '杭州市']

function applyFilter() {
  console.log('筛选条件', filters)
  // 可以发出事件通知 MapView.vue 去筛选显示
}

function resetFilter() {
  filters.city = ''
  filters.status = ''
}
</script>

<style scoped>
.filter-form {
  margin-bottom: 16px;
}
</style>
