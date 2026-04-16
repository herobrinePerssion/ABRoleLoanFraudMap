<template>
  <div class="stats-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      </el-breadcrumb>
      <h1>数据统计</h1>
      <p class="subtitle">实时诈骗风险数据和预警分析</p>
    </div>

    <!-- 加载状态 -->
    <LoadingSpinner v-if="isLoading" />

    <!-- KPI卡片 -->
    <div v-else class="kpi-section">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :md="6">
          <div class="kpi-card">
            <div class="kpi-icon">📋</div>
            <div class="kpi-content">
              <p class="kpi-label">累计案例</p>
              <p class="kpi-value">{{ stats.totalCases }}</p>
              <span class="kpi-trend">+12 本月新增</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="kpi-card">
            <div class="kpi-icon">🚨</div>
            <div class="kpi-content">
              <p class="kpi-label">用户举报</p>
              <p class="kpi-value">{{ stats.totalReports }}</p>
              <span class="kpi-trend">+5 本月新增</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-content">
              <p class="kpi-label">涉案金额</p>
              <p class="kpi-value">{{ formatAmount(stats.totalLoss) }}</p>
              <span class="kpi-trend">统计范围内</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="kpi-card">
            <div class="kpi-icon">⚠️</div>
            <div class="kpi-content">
              <p class="kpi-label">风险等级</p>
              <p class="kpi-value risk-high">高风险</p>
              <span class="kpi-trend">需要警惕</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 统计图表 -->
    <div v-if="!isLoading" class="charts-section">
      <el-row :gutter="20">
        <!-- 地区分布 -->
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>诈骗案例地区分布</h3>
                <span class="card-subtitle">按地区统计</span>
              </div>
            </template>

            <div class="region-distribution">
              <div
                v-for="(count, region) in stats.regionDistribution"
                :key="region"
                class="region-item"
              >
                <div class="region-name">{{ region }}</div>
                <div class="region-bar">
                  <div
                    class="region-fill"
                    :style="{
                      width: ((count / maxRegionCount) * 100) + '%',
                    }"
                  ></div>
                </div>
                <div class="region-count">{{ count }}</div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 诈骗类型分布 -->
        <el-col :xs="24" :md="12">
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="card-header">
                <h3>诈骗类型分布</h3>
                <span class="card-subtitle">按诈骗方式统计</span>
              </div>
            </template>

            <div class="scam-type-distribution">
              <div
                v-for="(count, type) in stats.scamTypeDistribution"
                :key="type"
                class="type-item"
              >
                <div class="type-header">
                  <span class="type-name">{{ type }}</span>
                  <span class="type-percent">
                    {{
                      (
                        (count /
                          Object.values(stats.scamTypeDistribution).reduce(
                            (a, b) => a + b,
                            0
                          )) *
                        100
                      ).toFixed(1)
                    }}%
                  </span>
                </div>
                <el-progress
                  :percentage="
                    (count /
                      Object.values(stats.scamTypeDistribution).reduce(
                        (a, b) => a + b,
                        0
                      )) *
                    100
                  "
                  :stroke-width="8"
                  color="#f56c6c"
                />
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 高频话术 -->
    <div v-if="!isLoading" class="common-phrases-section">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <h3>诈骗高频话术TOP 10</h3>
            <span class="card-subtitle">警惕这些常见说法</span>
          </div>
        </template>

        <el-table :data="commonPhrases" size="small" :stripe="true">
          <el-table-column label="排名" width="60">
            <template #default="scope">
              <el-tag
                :type="scope.$index < 3 ? 'danger' : scope.$index < 6 ? 'warning' : 'info'"
              >
                {{ scope.$index + 1 }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="phrase" label="高频话术" min-width="200" />
          <el-table-column prop="frequency" label="出现频次" width="100">
            <template #default="scope">
              <span class="frequency-badge">{{ scope.row.frequency }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="riskLevel" label="风险等级" width="100">
            <template #default="scope">
              <el-tag :type="getRiskTagType(scope.row.riskLevel)">
                {{ scope.row.riskLevel }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 风险提示 -->
    <div v-if="!isLoading" class="warning-section">
      <el-alert
        type="warning"
        :closable="false"
        title="⚠️ 安全提醒"
      >
        <template #default>
          <div class="warning-content">
            <p>📌 如遇以下情况，警惕诈骗：</p>
            <ul>
              <li>陌生人主动电话、短信、微信添加，声称可以贷款或办理分期</li>
              <li>贷款前要求交纳保证金、利息、税费等各种费用</li>
              <li>声称需要拍照、扫码、点击链接进行身份认证或刷流水</li>
              <li>诱导将钱转入指定账户进行"资金冻结解除"或"征信修复"</li>
              <li>利用官方渠道（如支付宝蚂蚁借呗）的相似界面进行诱骗</li>
            </ul>
            <p>✅ 记住安全建议：</p>
            <ul>
              <li>正规贷款机构不会在放款前收取任何费用</li>
              <li>遇到疑似诈骗，请立即致电110举报</li>
              <li>如已被骗，请保留证据并向警方报案</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { statsApi } from '@/services/mockApi';

// 状态
const isLoading = ref(true);
const stats = reactive({
  totalCases: 0,
  totalReports: 0,
  totalLoss: 0,
  regionDistribution: {} as Record<string, number>,
  scamTypeDistribution: {} as Record<string, number>,
});

// 高频话术数据
const commonPhrases = ref([
  { phrase: '您的贷款已通过审核，需要先交保证金', frequency: 342, riskLevel: '高' },
  { phrase: '征信修复可以解决贷款问题', frequency: 298, riskLevel: '高' },
  { phrase: '需要刷流水才能提高额度', frequency: 276, riskLevel: '高' },
  { phrase: '官方授权代理，可加急办理', frequency: 254, riskLevel: '高' },
  { phrase: '微粒贷、借呗、金条邀请您申请', frequency: 231, riskLevel: '中' },
  { phrase: '账户异常，需要验证身份信息', frequency: 218, riskLevel: '中' },
  { phrase: '恭喜获得免息贷款资格', frequency: 195, riskLevel: '中' },
  { phrase: '解冻账户需先转账', frequency: 187, riskLevel: '高' },
  { phrase: '我们是国有银行合作机构', frequency: 164, riskLevel: '中' },
  { phrase: '需要验证卡号和密码激活额度', frequency: 156, riskLevel: '高' },
]);

// 计算属性
const maxRegionCount = computed(() => {
  const counts = Object.values(stats.regionDistribution);
  return counts.length > 0 ? Math.max(...counts) : 1;
});

// 方法
const loadStats = async () => {
  try {
    const data = await statsApi.getStats();
    stats.totalCases = data.totalCases;
    stats.totalReports = data.totalReports;
    stats.totalLoss = data.totalLoss;
    stats.regionDistribution = data.regionDistribution;
    stats.scamTypeDistribution = data.scamTypeDistribution;
  } catch (error) {
    console.error('Failed to load stats:', error);
  } finally {
    isLoading.value = false;
  }
};

const formatAmount = (amount: number) => {
  if (amount >= 100000000) {
    return `¥${(amount / 100000000).toFixed(1)}亿`;
  }
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount}`;
};

const getRiskTagType = (level: string): any => {
  const map: Record<string, string> = {
    高: 'danger',
    中: 'warning',
    低: 'success',
  };
  return map[level] || 'info';
};

// 初始化
loadStats();
</script>

<style scoped lang="scss">
.stats-view {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.page-header {
  max-width: 1200px;
  margin: 0 auto 40px;
  text-align: center;

  :deep(.el-breadcrumb) {
    margin-bottom: 20px;
    justify-content: center;
  }

  h1 {
    font-size: 32px;
    color: #333;
    margin: 15px 0;
  }

  .subtitle {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

.kpi-section {
  max-width: 1200px;
  margin: 0 auto 40px;

  .kpi-card {
    display: flex;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    }

    .kpi-icon {
      font-size: 40px;
      flex-shrink: 0;
    }

    .kpi-content {
      flex: 1;

      .kpi-label {
        margin: 0;
        font-size: 14px;
        color: #666;
      }

      .kpi-value {
        margin: 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #333;

        &.risk-high {
          color: #f56c6c;
        }
      }

      .kpi-trend {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.charts-section {
  max-width: 1200px;
  margin: 0 auto 40px;

  .chart-card {
    :deep(.el-card__header) {
      padding: 20px;
      border-bottom: 2px solid #f0f0f0;

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          margin: 0;
          font-size: 16px;
          color: #333;
          font-weight: 600;
        }

        .card-subtitle {
          font-size: 12px;
          color: #999;
        }
      }
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}

.region-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .region-item {
    display: flex;
    align-items: center;
    gap: 12px;

    .region-name {
      min-width: 60px;
      font-size: 14px;
      font-weight: 500;
      color: #333;
    }

    .region-bar {
      flex: 1;
      height: 24px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;

      .region-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s;
      }
    }

    .region-count {
      min-width: 40px;
      text-align: right;
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }
  }
}

.scam-type-distribution {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .type-item {
    .type-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;

      .type-name {
        font-weight: 500;
        color: #333;
      }

      .type-percent {
        color: #f56c6c;
        font-weight: 600;
      }
    }

    :deep(.el-progress) {
      width: 100%;
    }
  }
}

.common-phrases-section {
  max-width: 1200px;
  margin: 0 auto 40px;

  .frequency-badge {
    display: inline-block;
    padding: 4px 12px;
    background: #fff5f5;
    color: #f56c6c;
    border-radius: 12px;
    font-weight: 600;
    font-size: 12px;
  }

  :deep(.el-table) {
    .el-table__body tr:hover > td {
      background-color: #f9f9f9 !important;
    }
  }
}

.warning-section {
  max-width: 1200px;
  margin: 0 auto;

  .warning-content {
    p {
      margin: 12px 0;
      font-size: 14px;
      color: #606266;
      font-weight: 600;

      &:first-child {
        margin-top: 0;
      }
    }

    ul {
      margin: 8px 0;
      padding-left: 20px;

      li {
        margin: 6px 0;
        font-size: 13px;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

@media (max-width: 768px) {
  .stats-view {
    padding: 20px 15px;
  }

  .page-header {
    h1 {
      font-size: 24px;
    }
  }

  .kpi-card {
    flex-direction: column;
    text-align: center;
  }

  .region-item {
    flex-wrap: wrap;

    .region-bar {
      width: 100%;
      order: 3;
      flex-basis: 100%;
    }
  }

  .warning-section {
    :deep(.el-alert) {
      .warning-content {
        ul {
          padding-left: 18px;

          li {
            font-size: 12px;
          }
        }
      }
    }
  }
}
</style>
