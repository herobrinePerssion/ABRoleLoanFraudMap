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
      <el-button type="primary" :loading="submitting" :disabled="submitting" @click="submit">提交</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import type { ReportFormData } from '@/types/report'
import { createReportRecord, saveReportRecord } from '@/services/reportService'

const emit = defineEmits<{
  (e: 'submitted', payload: { id: string }): void
}>()

const form = reactive<ReportFormData>({
  name: '',
  location: [],
  address: '',
  description: ''
})
const submitting = ref(false)

const cityOptions = [
  { value: '广东省', label: '广东省', children: [{ value: '深圳市', label: '深圳市' }] },
  { value: '北京市', label: '北京市', children: [{ value: '北京市', label: '北京市' }] }
]

function submit() {
  if (submitting.value) {
    return
  }

  const name = form.name.trim()
  const address = form.address.trim()
  const description = form.description.trim()

  if (!name || !form.location.length || !address || !description) {
    ElMessage.warning('请完善举报信息后再提交')
    return
  }

  submitting.value = true
  try {
    const record = createReportRecord({
      name,
      location: form.location,
      address,
      description,
    })

    saveReportRecord(record)
    ElMessage.success(`提交成功，编号：${record.id}`)
    emit('submitted', { id: record.id })

    form.name = ''
    form.location = []
    form.address = ''
    form.description = ''
  } catch {
    ElMessage.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
@media (max-width: 768px) {
  :deep(.el-form) {
    --el-form-label-width: 0;
  }

  :deep(.el-form-item) {
    display: block;
  }

  :deep(.el-form-item__label) {
    display: block;
    width: 100% !important;
    margin-bottom: 6px;
    justify-content: flex-start;
    text-align: left;
  }

  :deep(.el-cascader),
  :deep(.el-button) {
    width: 100%;
  }
}
</style>
