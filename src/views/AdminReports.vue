<template>
  <el-main class="admin-page">
    <el-page-header content="举报审核后台" />

    <el-card shadow="never" class="admin-card">
      <template #header>
        <div class="card-head">
          <span>管理员账户</span>
          <el-button v-if="isLoggedIn" link type="danger" @click="logout">退出</el-button>
        </div>
      </template>

      <el-form :inline="true" class="toolbar" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="accountForm.username" placeholder="管理员账号" clearable />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="accountForm.password"
            type="password"
            show-password
            placeholder="管理员密码"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveAccountAndLoad">进入审核</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="admin-card">
      <template #header>
        <div class="card-head">
          <span>举报列表</span>
          <el-button type="primary" :loading="loading" @click="loadReports">刷新</el-button>
        </div>
      </template>

      <el-form :inline="true" class="toolbar" @submit.prevent>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="编号、公司、地区、地址" clearable />
        </el-form-item>
        <el-form-item>
          <el-button @click="loadReports">筛选</el-button>
        </el-form-item>
      </el-form>

      <el-alert v-if="error" :title="error" type="error" show-icon class="mb-12" />

      <el-table :data="reports" stripe v-loading="loading">
        <el-table-column prop="id" label="编号" width="150" />
        <el-table-column prop="name" label="公司名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="location" label="地区" min-width="140" show-overflow-tooltip />
        <el-table-column prop="address" label="地址" min-width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openReview(row)">审核</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="审核举报" width="720px" class="review-dialog">
      <template v-if="currentReport">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="编号">{{ currentReport.id }}</el-descriptions-item>
          <el-descriptions-item label="公司">{{ currentReport.name }}</el-descriptions-item>
          <el-descriptions-item label="地区">{{ currentReport.location }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ currentReport.address }}</el-descriptions-item>
          <el-descriptions-item label="描述">{{ currentReport.description }}</el-descriptions-item>
          <el-descriptions-item v-if="currentReport.mapPoint" label="坐标">
            {{ currentReport.mapPoint.lng.toFixed(6) }}, {{ currentReport.mapPoint.lat.toFixed(6) }}
          </el-descriptions-item>
        </el-descriptions>

        <el-form label-width="88px" class="review-form">
          <el-form-item label="审核状态">
            <el-select v-model="reviewForm.status">
              <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核意见">
            <el-input
              v-model="reviewForm.feedback"
              type="textarea"
              :rows="4"
              placeholder="填写处理意见、驳回原因或公开前说明"
            />
          </el-form-item>
        </el-form>
      </template>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="reviewing" @click="submitReview">提交审核</el-button>
      </template>
    </el-dialog>
  </el-main>
</template>

<script setup lang="ts">
import type { ReportRecord, ReportStatus } from '@/types/report'
import {
  clearAdminAccount,
  getAdminAccount,
  getAdminReports,
  reviewReport,
  saveAdminAccount,
  type AdminAccount,
} from '@/services/adminReportService'

const statusOptions: ReportStatus[] = ['待初审', '处理中', '已反馈', '已驳回']
const storedAccount = getAdminAccount()
const account = ref<AdminAccount>(storedAccount)
const accountForm = reactive<AdminAccount>({ ...storedAccount })
const reports = ref<ReportRecord[]>([])
const loading = ref(false)
const reviewing = ref(false)
const error = ref('')
const dialogVisible = ref(false)
const currentReport = ref<ReportRecord | null>(null)
const isLoggedIn = computed(() => Boolean(account.value.username && account.value.password))
const filters = reactive({
  status: '' as ReportStatus | '',
  keyword: '',
})
const reviewForm = reactive({
  status: '待初审' as ReportStatus,
  feedback: '',
})

function getStatusTag(status: ReportStatus) {
  const map: Record<ReportStatus, 'info' | 'warning' | 'success' | 'danger'> = {
    待初审: 'info',
    处理中: 'warning',
    已反馈: 'success',
    已驳回: 'danger',
  }
  return map[status] || 'info'
}

function formatTime(time: string) {
  return new Date(time).toLocaleString()
}

async function loadReports() {
  if (!account.value.username || !account.value.password) {
    ElMessage.warning('请先输入管理员账号和密码')
    return
  }

  loading.value = true
  error.value = ''
  try {
    const data = await getAdminReports({
      account: account.value,
      status: filters.status,
      keyword: filters.keyword,
    })
    reports.value = data.items
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

function saveAccountAndLoad() {
  const nextAccount = {
    username: accountForm.username.trim(),
    password: accountForm.password,
  }

  if (!nextAccount.username || !nextAccount.password) {
    ElMessage.warning('请输入管理员账号和密码')
    return
  }

  saveAdminAccount(nextAccount)
  account.value = nextAccount
  loadReports()
}

function logout() {
  clearAdminAccount()
  account.value = { username: 'abRoleAdmin', password: '' }
  accountForm.username = 'abRoleAdmin'
  accountForm.password = ''
  reports.value = []
}

function openReview(report: ReportRecord) {
  currentReport.value = report
  reviewForm.status = report.status
  reviewForm.feedback = ''
  dialogVisible.value = true
}

async function submitReview() {
  if (!currentReport.value) return

  reviewing.value = true
  try {
    const updated = await reviewReport({
      account: account.value,
      id: currentReport.value.id,
      status: reviewForm.status,
      feedback: reviewForm.feedback,
    })
    const index = reports.value.findIndex(item => item.id === updated.id)
    if (index >= 0) reports.value[index] = updated
    dialogVisible.value = false
    ElMessage.success('审核已更新')
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '审核失败')
  } finally {
    reviewing.value = false
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    loadReports()
  }
})
</script>

<style scoped>
.admin-page {
  padding: 0 20px 20px;
}

.admin-card {
  margin-top: 12px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-weight: 600;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0 12px;
}

.mb-12 {
  margin-bottom: 12px;
}

.review-form {
  margin-top: 16px;
}

@media (max-width: 768px) {
  .admin-page {
    padding: 0 12px 16px;
  }

  .toolbar :deep(.el-form-item),
  .toolbar :deep(.el-form-item__content),
  .toolbar :deep(.el-input),
  .toolbar :deep(.el-select),
  .toolbar :deep(.el-button) {
    width: 100%;
  }

  .review-dialog :deep(.el-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
