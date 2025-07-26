<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:42:07
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 17:42:10
 * @Description: 
-->
<template>
  <el-card>
    <h2>{{ company.name }}</h2>
    <p><strong>省市：</strong>{{ company.province }} {{ company.city }}</p>
    <p><strong>地址：</strong>{{ company.address }}</p>
    <p><strong>描述：</strong>{{ company.description }}</p>
    <p><strong>状态：</strong><el-tag>{{ company.status }}</el-tag></p>

    <h3 class="mt-4">举报记录</h3>
    <CommentList />
  </el-card>
</template>

<script setup lang="ts">
import CommentList from '@/components/CommentList.vue'

// 模拟传参
const company = {
  name: '某某金融科技有限公司',
  province: '广东省',
  city: '深圳市',
  address: '福田区某大厦',
  description: '诱导贷款、伪造担保合同',
  status: '立案中'
}
</script>

<style scoped>
.mt-4 {
  margin-top: 24px;
}
</style>
