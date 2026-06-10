<template>
  <div class="home-page">
    <el-card class="hero" shadow="never">
      <template #header>
        <div class="hero-title">AB贷风险识别与非法中介举报平台</div>
      </template>
      <p class="hero-desc">
        AB贷通常是实际用款人A资质不足，黑中介诱导征信较好的B以本人名义申请贷款。钱由A使用，合同和征信风险却可能落到B身上。
      </p>
      <div class="hero-tags">
        <el-tag type="danger">高风险：担保人变借款人</el-tag>
        <el-tag type="warning">警惕：监管人/紧急联系人话术</el-tag>
        <el-tag>建议：保存合同、聊天、转账和门店证据</el-tag>
      </div>
      <div class="hero-actions">
        <el-button type="primary" class="quiz-btn" @click="goQuiz">3分钟AB贷自测</el-button>
        <el-button @click="goReport">举报非法中介</el-button>
      </div>
    </el-card>

    <el-alert
      title="风险提醒：凡是让你替别人贷款、过账、做“监管人/紧急联系人”，都可能让你成为法律借款人。"
      type="error"
      show-icon
      :closable="false"
      class="warning-alert"
    />

    <el-row :gutter="16" class="quick-entry-row">
      <el-col :xs="24" :sm="12" :lg="6" v-for="entry in quickEntries" :key="entry.title">
        <el-card shadow="hover" class="quick-entry-card" @click="goPath(entry.path)">
          <div class="entry-title">{{ entry.title }}</div>
          <div class="entry-desc">{{ entry.description }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <el-col :xs="24" :sm="24" :md="7" :lg="6">
        <VictimList class="victim-list" />
      </el-col>
      <el-col :xs="24" :sm="24" :md="17" :lg="18">
        <el-card shadow="never" class="map-panel">
          <FilterPanel />
          <MapView />
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="content-row">
      <el-col :xs="24" :lg="16">
        <el-card shadow="never" class="featured-card">
          <template #header>
            <div class="section-head">
              <span>公开案例</span>
              <el-button link type="primary" @click="goCases">查看全部</el-button>
            </div>
          </template>

          <el-row :gutter="16">
            <el-col :xs="24" :md="12" v-for="item in featuredCases" :key="item.id">
              <div class="featured-item" @click="goCaseDetail(item.id)">
                <div class="featured-top">
                  <h3>{{ item.title }}</h3>
                  <el-tag :type="item.riskLevel === '高' ? 'danger' : item.riskLevel === '中' ? 'warning' : 'success'">
                    {{ item.riskLevel }}风险
                  </el-tag>
                </div>
                <p class="featured-summary">{{ item.summary }}</p>
                <div class="featured-meta">{{ item.city }} · {{ item.scamType }} · ¥{{ item.amountLoss.toLocaleString() }}</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <el-card shadow="never" class="faq-card">
          <template #header>
            <div class="section-head">
              <span>常见问题</span>
              <el-button link type="primary" @click="goHelp">查看全部</el-button>
            </div>
          </template>

          <div v-for="item in faqPreview" :key="item.title" class="faq-preview-item" @click="goHelp">
            <div class="faq-preview-title">{{ item.title }}</div>
            <div class="faq-preview-desc">{{ item.description }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="cta-panel">
      <div class="cta-title">已经遇到疑似AB贷或助贷黑中介？现在就固定证据</div>
      <div class="cta-desc">
        先停止签字、刷脸、转账和过账，保存合同、聊天记录、转账凭证、门店照片和人员信息，再进行风险自测或提交举报。
      </div>
      <el-space wrap>
        <el-button type="primary" @click="goReport">立即举报</el-button>
        <el-button @click="goQuiz">开始自测</el-button>
        <el-button @click="goHelp">帮助中心</el-button>
        <el-button @click="goPolicy">隐私声明</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import MapView from '@/components/MapView.vue'
import FilterPanel from '@/components/FilterPanel.vue'
import VictimList from '@/components/VictimList.vue'
import { FRAUD_CASES } from '@/constants/cases'

const router = useRouter()

const quickEntries = [
  { title: 'AB贷自测', description: '识别担保人、监管人、过账、转名等高危话术', path: '/quiz' },
  { title: '公开案例', description: '查看公开报道和监管提示整理的AB贷案例', path: '/cases' },
  { title: '举报入口', description: '提交非法中介门店、人员、地址和证据材料', path: '/report' },
  { title: '帮助中心', description: '了解AB贷定义、取证要点和后续处理建议', path: '/help' },
]

const faqPreview = [
  { title: 'AB贷是什么？', description: 'A用款、B申请贷款，B可能成为合同借款人并承担还款责任。' },
  { title: '哪些话术最危险？', description: '“只是担保”“监管人”“紧急联系人”“6个月转名”都要高度警惕。' },
  { title: '举报需要准备什么？', description: '建议准备门店地址、人员信息、合同、聊天记录、转账凭证和照片。' },
]

const featuredCases = computed(() => {
  return [...FRAUD_CASES]
    .sort((a, b) => b.amountLoss - a.amountLoss)
    .slice(0, 4)
})

function goQuiz() {
  router.push('/quiz')
}

function goReport() {
  router.push('/report')
}

function goCases() {
  router.push('/cases')
}

function goHelp() {
  router.push('/help')
}

function goPolicy() {
  router.push('/policy')
}

function goPath(path: string) {
  router.push(path)
}

function goCaseDetail(id: string) {
  router.push(`/cases/${id}`)
}
</script>

<style lang="scss" scoped>
.home-page {
  padding: 0 20px 20px;
}

.hero {
  margin-bottom: 16px;

  .hero-title {
    font-size: 20px;
    font-weight: 700;
  }

  .hero-desc {
    margin: 0 0 12px;
    color: #606266;
    line-height: 1.7;
  }

  .hero-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hero-actions {
    margin-top: 14px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
}

.warning-alert {
  margin-bottom: 16px;
}

.quick-entry-row {
  margin-bottom: 16px;
}

.quick-entry-card {
  cursor: pointer;
  transition: all .2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }

  .entry-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }

  .entry-desc {
    color: #909399;
    line-height: 1.6;
    min-height: 44px;
  }
}

.main-content {
  min-height: calc(100vh - 250px);
  margin-bottom: 16px;
}

.map-panel {
  min-height: calc(100vh - 260px);
}

.content-row {
  margin-bottom: 16px;
}

.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 16px;
  font-weight: 600;
}

.featured-item {
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all .2s ease;

  &:hover {
    border-color: #409eff;
    background: #f5f9ff;
  }

  .featured-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;

    h3 {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
    }
  }

  .featured-summary {
    margin: 10px 0;
    color: #606266;
    line-height: 1.6;
  }

  .featured-meta {
    color: #909399;
    font-size: 13px;
  }
}

.faq-card {
  height: 100%;
}

.faq-preview-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  .faq-preview-title {
    font-weight: 600;
    color: #303133;
    margin-bottom: 6px;
  }

  .faq-preview-desc {
    color: #909399;
    line-height: 1.6;
    font-size: 13px;
  }
}

.cta-panel {
  .cta-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 8px;
    color: #303133;
  }

  .cta-desc {
    color: #606266;
    line-height: 1.7;
    margin-bottom: 14px;
  }
}

@media (max-width: 992px) {
  .home-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .hero {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 14px;
    }

    .hero-title {
      font-size: 18px;
      line-height: 1.4;
      overflow-wrap: anywhere;
    }

    .hero-actions {
      :deep(.el-button) {
        width: 100%;
      }
    }
  }

  .main-content {
    min-height: auto;
  }

  .map-panel {
    min-height: auto;

    :deep(.el-card__body) {
      padding: 12px;
    }
  }

  .featured-item {
    .featured-top {
      flex-wrap: wrap;

      h3 {
        min-width: 0;
        overflow-wrap: anywhere;
      }
    }
  }

  .section-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .cta-panel {
    :deep(.el-card__body) {
      padding: 14px;
    }

    .cta-title {
      font-size: 18px;
      line-height: 1.4;
    }

    :deep(.el-space),
    :deep(.el-space__item),
    :deep(.el-button) {
      width: 100%;
    }
  }
}
</style>
