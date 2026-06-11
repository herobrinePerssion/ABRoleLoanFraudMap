<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:42:07
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 17:42:10
 * @Description:
-->
<template>
  <el-main class="detail-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/cases', query: backQuery }">案例列表</el-breadcrumb-item>
      <el-breadcrumb-item>案例详情</el-breadcrumb-item>
    </el-breadcrumb>

    <el-page-header content="案例详情" @back="goCases" />

    <el-card v-if="currentCase" shadow="hover" class="case-card">
      <template #header>
        <div class="title-wrap">
          <div>
            <h2>{{ currentCase.title }}</h2>
            <div class="meta">{{ currentCase.city }} · {{ currentCase.scamType }}</div>
          </div>
          <el-tag :type="currentCase.riskLevel === '高' ? 'danger' : currentCase.riskLevel === '中' ? 'warning' : 'success'">
            {{ currentCase.riskLevel }}风险
          </el-tag>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="案件状态">{{ currentCase.progress }}</el-descriptions-item>
        <el-descriptions-item label="损失金额">¥{{ currentCase.amountLoss.toLocaleString() }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ currentCase.publishedAt }}</el-descriptions-item>
        <el-descriptions-item label="最近更新">{{ currentCase.updatedAt }}</el-descriptions-item>
        <el-descriptions-item label="可信级别">{{ currentCase.credibility }}</el-descriptions-item>
        <el-descriptions-item label="来源">
          <el-link :href="currentCase.sourceUrl" target="_blank">{{ currentCase.sourceName }}</el-link>
        </el-descriptions-item>
      </el-descriptions>

      <el-alert
        class="mt-14"
        type="warning"
        show-icon
        :closable="false"
        title="以下案例仅用于反诈科普，请勿将其作为唯一决策依据。"
      />

      <el-row :gutter="16" class="mt-14">
        <el-col :xs="24" :md="14">
          <el-card shadow="never">
            <template #header><div class="section-title">案件摘要</div></template>
            <p class="summary">{{ currentCase.summary }}</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="10">
          <el-card shadow="never">
            <template #header><div class="section-title">常见套路标签</div></template>
            <el-space wrap>
              <el-tag v-for="tag in currentCase.pattern" :key="tag" effect="plain">{{ tag }}</el-tag>
            </el-space>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" class="mt-14">
        <el-col :xs="24" :md="12">
          <el-card shadow="never">
            <template #header><div class="section-title">时间线</div></template>
            <el-timeline>
              <el-timeline-item v-for="(item, idx) in currentCase.timeline" :key="idx" :timestamp="item.time">
                {{ item.event }}
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </el-col>
        <el-col :xs="24" :md="12">
          <el-card shadow="never" class="mb-14">
            <template #header><div class="section-title">预警信号</div></template>
            <ul class="list">
              <li v-for="(item, idx) in currentCase.warningSignals" :key="idx">{{ item }}</li>
            </ul>
          </el-card>
          <el-card shadow="never">
            <template #header><div class="section-title">行动建议</div></template>
            <ul class="list">
              <li v-for="(item, idx) in currentCase.suggestions" :key="idx">{{ item }}</li>
            </ul>
          </el-card>
        </el-col>
      </el-row>

      <el-space class="mt-14">
        <el-button :disabled="!prevCase" @click="goCaseById(prevCase?.id)">上一条</el-button>
        <el-button :disabled="!nextCase" @click="goCaseById(nextCase?.id)">下一条</el-button>
        <el-button @click="copyShareLink">复制分享链接</el-button>
        <el-button type="primary" @click="goReport">我要举报相似线索</el-button>
        <el-button @click="goCases">返回案例列表</el-button>
      </el-space>

      <el-card shadow="never" class="mt-14 related-card">
        <template #header>
          <div class="section-title">相关推荐（同类诈骗）</div>
        </template>

        <el-row :gutter="12" v-if="relatedCases.length">
          <el-col :xs="24" :md="12" v-for="item in relatedCases" :key="item.id">
            <div class="related-item" @click="goCaseById(item.id)">
              <div class="related-title">{{ item.title }}</div>
              <div class="related-meta">{{ item.city }} · {{ item.progress }} · ¥{{ item.amountLoss.toLocaleString() }}</div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="暂无同类案例推荐" :image-size="72" />
      </el-card>
    </el-card>

    <el-card v-else shadow="never">
      <EmptyState
        title="案例不存在"
        description="未找到对应案例，请返回列表重试"
        action-text="返回案例列表"
        @action="goCases"
      />
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
import { FRAUD_CASES } from '@/constants/cases'

const route = useRoute()
const router = useRouter()

const backQuery = computed(() => ({ ...route.query }))

const currentCase = computed(() => {
  const id = String(route.params.id || '')
  return FRAUD_CASES.find(item => item.id === id) || null
})

const currentIndex = computed(() => {
  if (!currentCase.value) return -1
  return FRAUD_CASES.findIndex(item => item.id === currentCase.value?.id)
})

const prevCase = computed(() => {
  if (currentIndex.value <= 0) return null
  return FRAUD_CASES[currentIndex.value - 1]
})

const nextCase = computed(() => {
  if (currentIndex.value < 0 || currentIndex.value >= FRAUD_CASES.length - 1) return null
  return FRAUD_CASES[currentIndex.value + 1]
})

const relatedCases = computed(() => {
  if (!currentCase.value) return []
  return FRAUD_CASES
    .filter(item => item.id !== currentCase.value?.id && item.scamType === currentCase.value?.scamType)
    .slice(0, 4)
})

function goCases() {
  router.push({
    path: '/cases',
    query: backQuery.value,
  })
}

function goReport() {
  router.push('/report')
}

function goCaseById(id?: string) {
  if (!id) return
  router.push({
    path: `/cases/${id}`,
    query: backQuery.value,
  })
}

function copyShareLink() {
  const shareUrl = window.location.href
  navigator.clipboard.writeText(shareUrl)
    .then(() => ElMessage.success('分享链接已复制'))
    .catch(() => ElMessage.warning('复制失败，请手动复制地址栏链接'))
}
</script>

<style lang="scss" scoped>
.detail-page {
  padding: 0 20px 20px;
}

.breadcrumb {
  margin-bottom: 12px;
}

.case-card {
  margin-top: 12px;
}

.title-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;

  h2 {
    margin: 0;
  }

  .meta {
    margin-top: 8px;
    color: #909399;
    font-size: 13px;
  }
}

.mt-14 {
  margin-top: 14px;
}

.mb-14 {
  margin-bottom: 14px;
}

.section-title {
  font-weight: 600;
}

.summary {
  margin: 0;
  color: #606266;
  line-height: 1.7;
}

.list {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 8px;
    color: #606266;
  }
}

.related-card {
  .related-item {
    border: 1px solid #ebeef5;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: all .2s ease;

    &:hover {
      border-color: #409eff;
      background: #f5f9ff;
    }

    .related-title {
      font-weight: 600;
      color: #303133;
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .related-meta {
      color: #909399;
      font-size: 12px;
    }
  }
}

@media (max-width: 992px) {
  .detail-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .detail-page {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 14px;
    }
  }

  .title-wrap,
  :deep(.el-space.mt-14) {
    align-items: stretch;
    flex-direction: column;
  }

  :deep(.el-space.mt-14),
  :deep(.el-space.mt-14 .el-space__item),
  :deep(.el-space.mt-14 .el-button) {
    width: 100%;
  }

  :deep(.el-descriptions__label) {
    width: 92px;
  }

  .related-card .related-item {
    margin-bottom: 10px;
  }
}
</style>
