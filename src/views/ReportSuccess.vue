<template>
  <el-main class="success-page">
    <el-page-header content="举报提交结果" @back="goBack" />

    <el-row :gutter="20" class="layout-row">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">提交状态</div>
          </template>

          <template v-if="queryLoading">
            <el-skeleton :rows="6" animated />
          </template>

          <template v-else-if="queryError">
            <ErrorState
              title="查询失败"
              :description="queryError"
              retry-text="重试查询"
              secondary-text="返回举报页"
              @retry="retryQuery"
              @secondary="goReport"
            />
          </template>

          <template v-else-if="record">
            <el-result icon="success" title="举报提交成功" sub-title="请保存编号，用于后续进度查询。">
              <template #extra>
                <el-space>
                  <el-tag type="success" size="large">编号：{{ record.id }}</el-tag>
                  <el-button @click="copyId">复制编号</el-button>
                </el-space>
              </template>
            </el-result>

            <el-steps :active="activeStep" finish-status="success" align-center>
              <el-step title="已提交" />
              <el-step title="待初审" />
              <el-step title="处理中" />
              <el-step title="已反馈" />
            </el-steps>

            <el-descriptions class="record-desc" :column="1" border>
              <el-descriptions-item label="线索编号">{{ record.id }}</el-descriptions-item>
              <el-descriptions-item label="提交时间">{{ formatTime(record.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="公司名称">{{ record.name }}</el-descriptions-item>
              <el-descriptions-item label="所在地区">{{ record.location }}</el-descriptions-item>
              <el-descriptions-item v-if="record.address" label="公司地址">{{ record.address }}</el-descriptions-item>
              <el-descriptions-item v-if="record.mapPoint" label="地图坐标">
                {{ record.mapPoint.lng.toFixed(6) }}, {{ record.mapPoint.lat.toFixed(6) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="record.legalPersonName" label="法人/负责人">
                {{ record.legalPersonName }}
              </el-descriptions-item>
              <el-descriptions-item v-if="record.contactPhone || record.legalPersonPhone" label="联系方式">
                {{ [record.legalPersonPhone, record.contactPhone].filter(Boolean).join(' / ') }}
              </el-descriptions-item>
              <el-descriptions-item v-if="record.attachments?.length" label="附件材料">
                <el-space wrap>
                  <el-link
                    v-for="file in record.attachments"
                    :key="file.id"
                    type="primary"
                    :href="file.url"
                    target="_blank"
                  >
                    {{ file.name }}
                  </el-link>
                </el-space>
              </el-descriptions-item>
              <el-descriptions-item v-else-if="record.photoNames?.length" label="照片材料">
                {{ record.photoNames.join('、') }}
              </el-descriptions-item>
              <el-descriptions-item v-if="record.description" label="线索描述">
                {{ record.description }}
              </el-descriptions-item>
              <el-descriptions-item label="当前状态">
                <el-tag :type="statusTagType">
                  {{ record.status }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <el-timeline class="mt-16">
              <el-timeline-item v-for="(item, idx) in record.updates" :key="idx" :timestamp="item.time">
                {{ item.content }}
              </el-timeline-item>
            </el-timeline>
          </template>

          <template v-else>
            <EmptyState
              title="暂未找到线索"
              description="未找到对应编号，请检查后重试"
              action-text="返回举报入口"
              @action="goReport"
            />
          </template>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never">
          <template #header>
            <div class="card-title">编号查询</div>
          </template>
          <el-input v-model="queryId" placeholder="请输入举报编号" clearable />
          <el-button type="primary" class="query-btn" @click="search">查询</el-button>
          <el-button class="query-btn" @click="goReport">继续提交新线索</el-button>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
import { REPORT_STATUS_STEP_INDEX, REPORT_STATUS_TAG_TYPE } from '@/constants/report'
import { findReportById, normalizeReportId } from '@/services/reportService'
import type { ReportRecord } from '@/types/report'

const route = useRoute()
const router = useRouter()
const queryId = ref('')
const record = ref<ReportRecord | null>(null)
const queryLoading = ref(false)
const queryError = ref('')

const activeStep = computed(() => {
  if (!record.value) return 0
  return REPORT_STATUS_STEP_INDEX[record.value.status]
})

const statusTagType = computed(() => {
  if (!record.value) return 'info'
  return REPORT_STATUS_TAG_TYPE[record.value.status]
})

async function loadRecordById(id: string) {
  const cleanId = normalizeReportId(id)
  if (!cleanId) {
    record.value = null
    return
  }
  record.value = await findReportById(cleanId)
}

async function executeQuery(id: string) {
  queryLoading.value = true
  queryError.value = ''
  try {
    await loadRecordById(id)
  } catch (error) {
    record.value = null
    queryError.value = error instanceof Error ? error.message : '查询异常，请稍后重试'
  } finally {
    queryLoading.value = false
  }
}

function search() {
  const id = normalizeReportId(queryId.value)
  if (!id) {
    ElMessage.warning('请输入举报编号')
    return
  }
  router.replace({ path: '/report/success', query: { id } })
}

function retryQuery() {
  const id = normalizeReportId(queryId.value)
  if (!id) {
    ElMessage.warning('请输入举报编号')
    return
  }
  executeQuery(id)
}

function copyId() {
  if (!record.value) return
  navigator.clipboard.writeText(record.value.id)
    .then(() => ElMessage.success('编号已复制'))
    .catch(() => ElMessage.warning('复制失败，请手动记录编号'))
}

function goBack() {
  router.push('/report')
}

function goReport() {
  router.push('/report')
}

function formatTime(time: string) {
  return new Date(time).toLocaleString()
}

watch(
  () => route.query.id as string | string[] | null | undefined,
  (newVal) => {
    const id = typeof newVal === 'string' ? normalizeReportId(newVal) : ''
    queryId.value = id
    if (!id) {
      record.value = null
      queryError.value = ''
      queryLoading.value = false
      return
    }
    executeQuery(id)
  },
  { immediate: true }
)
</script>

<style lang="scss" scoped>
.success-page {
  padding: 0 20px 20px;
}

.layout-row {
  margin-top: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.record-desc {
  margin-top: 16px;
}

.mt-16 {
  margin-top: 16px;
}

.query-btn {
  margin-top: 10px;
  width: 100%;
}

@media (max-width: 992px) {
  .success-page {
    padding: 0 12px 16px;
  }
}
</style>
