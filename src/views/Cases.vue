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
      </el-form>
    </el-card>

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
import { FRAUD_CASES } from '@/constants/cases'
import type { FraudCase } from '@/types/case'

const router = useRouter()
const route = useRoute()

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

const regionOptions = computed(() => [...new Set(FRAUD_CASES.map(item => item.region))])
const scamTypeOptions = computed(() => [...new Set(FRAUD_CASES.map(item => item.scamType))])

const filteredCases = computed(() => {
  const keyword = filters.keyword.trim().toLowerCase()

  const base = FRAUD_CASES.filter((item) => {
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

function goDetail(id: FraudCase['id']) {
  router.push({
    path: `/cases/${id}`,
    query: route.query,
  })
}

function goReport() {
  router.push('/report')
}
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
