<template>
  <el-card header="举报信息表" class="victim-list-card">
    <el-empty v-if="reports.length === 0" description="暂无举报信息" />
    <el-table
      v-else
      :data="reports"
      stripe
      size="small"
      class="report-table"
      height="100%"
      @row-click="handleClick"
    >
      <el-table-column prop="name" label="公司名称" min-width="130" show-overflow-tooltip />
      <el-table-column prop="city" label="城市" width="86" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="92" show-overflow-tooltip />
      <el-table-column label="标点" width="64" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.location" type="danger" size="small">有</el-tag>
          <el-tag v-else type="info" size="small">无</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { getSubmittedReportRows } from '@/services/reportMapService'

type ReportRow = ReturnType<typeof getSubmittedReportRows>[number]

const reports = ref<ReportRow[]>([])

function loadReports() {
  reports.value = getSubmittedReportRows()
}

function handleClick(report: ReportRow) {
  if (!report.location) {
    ElMessage.info('该举报暂未提交地图标点')
    return
  }

  window.dispatchEvent(new CustomEvent('map-locate', { detail: report.location }))
}

function handleStorage(event: StorageEvent) {
  if (!event.key || event.key === 'ab-fraud-report-records') {
    loadReports()
  }
}

onMounted(() => {
  loadReports()
  window.addEventListener('storage', handleStorage)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorage)
})
</script>

<style scoped>
.victim-list-card {
  height: calc(100vh - 260px);
  min-height: 360px;
  overflow: hidden;
}

.victim-list-card :deep(.el-card__body) {
  height: calc(100% - 58px);
  padding: 0;
}

.report-table {
  width: 100%;
  cursor: pointer;
}

@media (max-width: 768px) {
  .victim-list-card {
    height: auto;
    min-height: 0;
  }

  .victim-list-card :deep(.el-card__body) {
    height: auto;
  }

  .report-table {
    height: 320px;
  }
}
</style>
