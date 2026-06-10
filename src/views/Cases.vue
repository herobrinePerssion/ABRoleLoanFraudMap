<template>
  <el-main class="cases-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>案例列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-page-header content="案例列表" />

    <el-row :gutter="16" class="kpi-row">
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">案例总数</div>
          <div class="kpi-value">{{ filteredCases.length }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">高风险案例</div>
          <div class="kpi-value danger">{{ highRiskCount }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">平均损失金额</div>
          <div class="kpi-value">¥{{ avgLoss }}</div>
        </el-card>
      </el-col>
      <el-col :xs="12" :md="6">
        <el-card shadow="hover" class="kpi-card">
          <div class="kpi-label">已判决占比</div>
          <div class="kpi-value">{{ judgedRate }}%</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filters">
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="标题/摘要/城市" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="地区">
          <el-select v-model="filters.region" clearable placeholder="全部" style="width: 140px">
            <el-option v-for="item in regionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="诈骗类型">
          <el-select v-model="filters.scamType" clearable placeholder="全部" style="width: 170px">
            <el-option v-for="item in scamTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险等级">
          <el-select v-model="filters.riskLevel" clearable placeholder="全部" style="width: 130px">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.progress" clearable placeholder="全部" style="width: 130px">
            <el-option label="待核验" value="待核验" />
            <el-option label="立案中" value="立案中" />
            <el-option label="已判决" value="已判决" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-select v-model="filters.sortBy" style="width: 180px">
            <el-option label="最新更新时间" value="updated-desc" />
            <el-option label="损失金额从高到低" value="amount-desc" />
            <el-option label="损失金额从低到高" value="amount-asc" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button @click="resetFilters">重置筛选</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="openCreateDialog">新增案例</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑案例' : '新增案例'"
      width="620px"
      destroy-on-close
    >
      <el-form ref="caseFormRef" :model="caseForm" :rules="caseRules" label-width="96px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="caseForm.title" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input v-model="caseForm.city" placeholder="如：上海" />
        </el-form-item>
        <el-form-item label="地区" prop="region">
          <el-input v-model="caseForm.region" placeholder="如：华东" />
        </el-form-item>
        <el-form-item label="诈骗类型" prop="scamType">
          <el-input v-model="caseForm.scamType" placeholder="如：贷款诈骗" />
        </el-form-item>
        <el-form-item label="风险等级" prop="riskLevel">
          <el-select v-model="caseForm.riskLevel" style="width: 100%">
            <el-option label="高" value="高" />
            <el-option label="中" value="中" />
            <el-option label="低" value="低" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态" prop="progress">
          <el-select v-model="caseForm.progress" style="width: 100%">
            <el-option label="待核验" value="待核验" />
            <el-option label="立案中" value="立案中" />
            <el-option label="已判决" value="已判决" />
          </el-select>
        </el-form-item>
        <el-form-item label="损失金额" prop="amountLoss">
          <el-input-number v-model="caseForm.amountLoss" :min="0" :step="1000" style="width: 100%" />
        </el-form-item>
        <el-form-item label="摘要" prop="summary">
          <el-input v-model="caseForm.summary" type="textarea" :rows="3" maxlength="200" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="submitCaseForm">保存</el-button>
      </template>
    </el-dialog>

    <el-row :gutter="16" class="list-row" v-if="pagedCases.length">
      <el-col :xs="24" :md="12" v-for="item in pagedCases" :key="item.id">
        <el-card shadow="hover" class="case-card">
          <div class="title-row">
            <h3>{{ item.title }}</h3>
            <el-tag :type="item.riskLevel === '高' ? 'danger' : item.riskLevel === '中' ? 'warning' : 'success'">
              {{ item.riskLevel }}风险
            </el-tag>
          </div>

          <div class="meta-row">
            <span>{{ item.city }}</span>
            <span>类型：{{ item.scamType }}</span>
            <span>状态：{{ item.progress }}</span>
          </div>

          <p class="summary">{{ item.summary }}</p>

          <div class="tag-row">
            <el-tag v-for="tag in item.pattern" :key="tag" size="small" effect="plain" class="pattern-tag">
              {{ tag }}
            </el-tag>
          </div>

          <div class="footer-row">
            <div class="loss">损失金额：<strong>¥{{ item.amountLoss.toLocaleString() }}</strong></div>
            <div class="btns">
              <el-button link type="primary" @click="goDetail(item.id)">查看详情</el-button>
              <el-button link @click="goReport">我要举报</el-button>
              <el-button v-if="isUserCase(item.id)" link type="warning" @click="openEditDialog(item)">编辑</el-button>
              <el-button v-if="isUserCase(item.id)" link type="danger" @click="removeCase(item.id)">删除</el-button>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-else shadow="never" class="empty-wrap">
      <EmptyState
        title="暂无匹配案例"
        description="请调整筛选条件或重置后再试"
        action-text="重置筛选"
        @action="resetFilters"
      />
    </el-card>

    <el-pagination
      v-if="filteredCases.length"
      class="pager"
      background
      layout="total, prev, pager, next"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      :total="filteredCases.length"
      @current-change="onPageChange"
    />
  </el-main>
</template>

<script setup lang="ts">
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { caseApi } from '@/services/mockApi'
import type { FraudCase } from '@/types/case'

const router = useRouter()
const route = useRoute()
const allCases = ref<FraudCase[]>([])

const dialogVisible = ref(false)
const editingId = ref('')
const saving = ref(false)
const caseFormRef = ref<FormInstance>()

const caseForm = reactive({
  title: '',
  city: '',
  region: '',
  scamType: '',
  riskLevel: '中' as FraudCase['riskLevel'],
  progress: '待核验' as FraudCase['progress'],
  amountLoss: 0,
  summary: '',
})

const caseRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  region: [{ required: true, message: '请输入地区', trigger: 'blur' }],
  scamType: [{ required: true, message: '请输入诈骗类型', trigger: 'blur' }],
  summary: [{ required: true, message: '请输入摘要', trigger: 'blur' }],
}

const filters = reactive({
  keyword: '',
  region: '',
  scamType: '',
  riskLevel: '',
  progress: '',
  sortBy: 'updated-desc',
})

const pagination = reactive({
  page: 1,
  pageSize: 4,
})

const regionOptions = computed(() => [...new Set(allCases.value.map(item => item.region))])
const scamTypeOptions = computed(() => [...new Set(allCases.value.map(item => item.scamType))])

const filteredCases = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  const base = allCases.value.filter((item) => {
    const keywordMatched = !keyword
      || item.title.toLowerCase().includes(keyword)
      || item.summary.toLowerCase().includes(keyword)
      || item.city.toLowerCase().includes(keyword)

    const regionMatched = !filters.region || item.region === filters.region
    const typeMatched = !filters.scamType || item.scamType === filters.scamType
    const riskMatched = !filters.riskLevel || item.riskLevel === filters.riskLevel
    const progressMatched = !filters.progress || item.progress === filters.progress

    return keywordMatched && regionMatched && typeMatched && riskMatched && progressMatched
  })

  return [...base].sort((a, b) => {
    if (filters.sortBy === 'amount-desc') {
      return b.amountLoss - a.amountLoss
    }
    if (filters.sortBy === 'amount-asc') {
      return a.amountLoss - b.amountLoss
    }
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
})

const pagedCases = computed(() => {
  const start = (pagination.page - 1) * pagination.pageSize
  return filteredCases.value.slice(start, start + pagination.pageSize)
})

const highRiskCount = computed(() => filteredCases.value.filter(item => item.riskLevel === '高').length)

const avgLoss = computed(() => {
  if (!filteredCases.value.length) return '0'
  const sum = filteredCases.value.reduce((acc, item) => acc + item.amountLoss, 0)
  return Math.round(sum / filteredCases.value.length).toLocaleString()
})

const judgedRate = computed(() => {
  if (!filteredCases.value.length) return 0
  const judged = filteredCases.value.filter(item => item.progress === '已判决').length
  return Math.round((judged / filteredCases.value.length) * 100)
})

function applyQueryToState() {
  filters.keyword = typeof route.query.keyword === 'string' ? route.query.keyword : ''
  filters.region = typeof route.query.region === 'string' ? route.query.region : ''
  filters.scamType = typeof route.query.scamType === 'string' ? route.query.scamType : ''
  filters.riskLevel = typeof route.query.riskLevel === 'string' ? route.query.riskLevel : ''
  filters.progress = typeof route.query.progress === 'string' ? route.query.progress : ''
  filters.sortBy = typeof route.query.sortBy === 'string' ? route.query.sortBy : 'updated-desc'

  const page = Number(route.query.page || 1)
  pagination.page = Number.isFinite(page) && page > 0 ? page : 1
}

function syncQueryFromState() {
  const query: Record<string, string> = {
    sortBy: filters.sortBy,
  }

  if (filters.keyword) query.keyword = filters.keyword
  if (filters.region) query.region = filters.region
  if (filters.scamType) query.scamType = filters.scamType
  if (filters.riskLevel) query.riskLevel = filters.riskLevel
  if (filters.progress) query.progress = filters.progress
  if (pagination.page > 1) query.page = String(pagination.page)

  router.replace({ path: '/cases', query })
}

watch(
  () => route.query,
  () => {
    applyQueryToState()
  },
  { immediate: true }
)

watch(
  () => ({ ...filters }),
  () => {
    pagination.page = 1
    syncQueryFromState()
  },
  { deep: true }
)

watch(
  () => pagination.page,
  () => {
    syncQueryFromState()
  }
)

function resetFilters() {
  filters.keyword = ''
  filters.region = ''
  filters.scamType = ''
  filters.riskLevel = ''
  filters.progress = ''
  filters.sortBy = 'updated-desc'
  pagination.page = 1
}

function onPageChange(page: number) {
  pagination.page = page
}

function resetCaseForm() {
  caseForm.title = ''
  caseForm.city = ''
  caseForm.region = ''
  caseForm.scamType = ''
  caseForm.riskLevel = '中'
  caseForm.progress = '待核验'
  caseForm.amountLoss = 0
  caseForm.summary = ''
}

async function loadCases() {
  const { items } = await caseApi.getCases({ page: 1, pageSize: 1000, sortBy: 'updated-desc' })
  allCases.value = items
}

function isUserCase(id: string) {
  return id.startsWith('user-') && caseApi.canManageCase(id)
}

function openCreateDialog() {
  editingId.value = ''
  resetCaseForm()
  dialogVisible.value = true
}

function openEditDialog(item: FraudCase) {
  if (!isUserCase(item.id)) {
    ElMessage.warning('仅创建该案例的浏览器可编辑')
    return
  }
  editingId.value = item.id
  caseForm.title = item.title
  caseForm.city = item.city
  caseForm.region = item.region
  caseForm.scamType = item.scamType
  caseForm.riskLevel = item.riskLevel
  caseForm.progress = item.progress
  caseForm.amountLoss = item.amountLoss
  caseForm.summary = item.summary
  dialogVisible.value = true
}

async function submitCaseForm() {
  if (!caseFormRef.value) return
  await caseFormRef.value.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (editingId.value) {
        await caseApi.updateCase(editingId.value, { ...caseForm })
        ElMessage.success('案例已更新')
      } else {
        await caseApi.createCase({ ...caseForm })
        ElMessage.success('案例已新增')
      }
      dialogVisible.value = false
      await loadCases()
    } catch (error: any) {
      ElMessage.error(error?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

async function removeCase(id: string) {
  try {
    await ElMessageBox.confirm('确认删除该用户录入案例吗？', '提示', {
      type: 'warning',
    })
    await caseApi.deleteCase(id)
    ElMessage.success('删除成功')
    await loadCases()
  } catch {
    // 用户取消
  }
}

function goDetail(id: FraudCase['id']) {
  router.push({
    path: `/cases/${id}`,
    query: route.query,
  })
}

function goReport() {
  router.push('/report')
}

onMounted(() => {
  loadCases()
})
</script>

<style lang="scss" scoped>
.cases-page {
  padding: 0 20px 20px;
}

.breadcrumb {
  margin-bottom: 12px;
}

.kpi-row {
  margin: 12px 0;
}

.kpi-card {
  .kpi-label {
    color: #909399;
    font-size: 13px;
    margin-bottom: 8px;
  }

  .kpi-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;

    &.danger {
      color: #f56c6c;
    }
  }
}

.filter-card {
  margin-bottom: 14px;
}

.filters {
  margin-bottom: -10px;
}

.list-row {
  margin-bottom: 14px;
}

.case-card {
  margin-bottom: 16px;

  .title-row {
    display: flex;
    justify-content: space-between;
    gap: 10px;

    h3 {
      margin: 0;
      font-size: 17px;
      line-height: 1.4;
    }
  }

  .meta-row {
    margin-top: 8px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    color: #909399;
    font-size: 13px;
  }

  .summary {
    margin: 10px 0;
    color: #606266;
    line-height: 1.6;
  }

  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .pattern-tag {
      margin: 0;
    }
  }

  .footer-row {
    margin-top: 12px;
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;

    .loss {
      color: #606266;
    }

    .btns {
      display: flex;
      gap: 6px;
    }
  }
}

.empty-wrap {
  margin-bottom: 14px;
}

.pager {
  justify-content: flex-end;
}

@media (max-width: 992px) {
  .cases-page {
    padding: 0 12px 16px;
  }

  .pager {
    justify-content: center;
  }
}
</style>
