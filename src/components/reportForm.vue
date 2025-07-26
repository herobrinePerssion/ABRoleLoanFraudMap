<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:39:48
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 17:39:53
 * @Description: 
-->
<template>
  <el-form :model="form" label-width="80px">
    <el-form-item label="公司名称">
      <el-input v-model="form.name" placeholder="请输入公司名称" />
    </el-form-item>
    <el-form-item label="省市">
      <el-cascader v-model="form.location" :options="cityOptions" placeholder="选择省市" />
    </el-form-item>
    <el-form-item label="详细地址">
      <el-input v-model="form.address" placeholder="如：某大厦12楼" />
    </el-form-item>
    <el-form-item label="描述">
      <el-input v-model="form.description" type="textarea" rows="4" placeholder="诈骗行为详情" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const form = reactive({
  name: '',
  location: [],
  address: '',
  description: ''
})

const cityOptions = [
  { value: '广东省', label: '广东省', children: [{ value: '深圳市', label: '深圳市' }] },
  { value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
]

function submit() {
  console.log('提交举报表单', form)
  // 你可以在此发送到后端或保存至 JSON 文件
}
</script>
