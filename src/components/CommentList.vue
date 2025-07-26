<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:40:22
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 23:57:39
 * @Description: 
-->
<template>
  <el-card>
    <el-scrollbar height="300px">
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in list"
          :key="index"
          :timestamp="item.time"
          placement="top"
        >
          <el-card>
            <strong>{{ item.name }}</strong><br />
            <span>{{ item.description }}</span>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-scrollbar>
  </el-card>
</template>

<script setup lang="ts">
const list = [
  { name: '某某公司', time: '2025-07-25', description: '诱导贷款，收取高额手续费' },
  { name: 'XX科技', time: '2025-07-24', description: '伪造担保合同，威胁还款' }
]
</script>
