<template>
  <div class="search-view">
    <!-- 搜索头部 -->
    <div class="search-header">
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索案例、举报、防骗知识..."
          @keyup.enter="handleSearch"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <el-button
              v-if="searchQuery"
              link
              type="primary"
              @click="handleSearch"
            >
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索类型过滤 -->
      <div class="search-filter">
        <el-radio-group v-model="searchType" @change="handleSearch">
          <el-radio label="">全部</el-radio>
          <el-radio label="cases">案例</el-radio>
          <el-radio label="reports">举报</el-radio>
        </el-radio-group>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div class="search-results">
      <!-- 热门搜索 -->
      <div v-if="!searchQuery && !isSearching" class="hot-searches">
        <h3>热门搜索</h3>
        <div class="hot-tags">
          <el-tag
            v-for="tag in hotSearches"
            :key="tag"
            clickable
            @click="searchQuery = tag; handleSearch()"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 加载态 -->
      <el-skeleton v-if="isSearching" :rows="3" animated />

      <!-- 错误态 -->
      <ErrorState
        v-else-if="searchError"
        title="搜索失败"
        :description="searchError"
        retryText="重新搜索"
        @retry="handleSearch"
      />

      <!-- 空结果 -->
      <EmptyState
        v-else-if="!isSearching && searchQuery && !hasResults"
        :title="`未找到 '${searchQuery}' 相关内容`"
        description="请检查搜索词是否正确，或尝试其他关键词"
        actionText="返回首页"
        @action="$router.push('/')"
      />

      <!-- 结果列表 -->
      <template v-else-if="hasResults">
        <!-- 案例结果 -->
        <section v-if="results.cases.length > 0" class="result-section">
          <h3>案例 ({{ results.cases.length }})</h3>
          <div class="result-items">
            <div
              v-for="caseItem in results.cases"
              :key="caseItem.id"
              class="result-item case-item"
              @click="goCaseDetail(caseItem.id)"
            >
              <div class="item-header">
                <h4>{{ caseItem.title }}</h4>
                <el-tag :type="getRiskTagType(caseItem.riskLevel)">
                  {{ caseItem.riskLevel }}风险
                </el-tag>
              </div>
              <p class="item-description">{{ caseItem.summary }}</p>
              <div class="item-footer">
                <span class="location">📍 {{ caseItem.city }}</span>
                <span class="type">{{ caseItem.scamType }}</span>
                <span class="amount">💰 {{ formatAmount(caseItem.amountLoss) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 举报结果 -->
        <section v-if="results.reports.length > 0" class="result-section">
          <h3>我的举报 ({{ results.reports.length }})</h3>
          <div class="result-items">
            <div
              v-for="report in results.reports"
              :key="report.reportId"
              class="result-item report-item"
              @click="goReportDetail(report.reportId)"
            >
              <div class="item-header">
                <h4>{{ report.title }}</h4>
                <el-tag :type="getReportTagType(report.status)">
                  {{ report.status }}
                </el-tag>
              </div>
              <p class="item-description">{{ report.description }}</p>
              <div class="item-footer">
                <span class="time">
                  ⏰ {{ formatTime(report.createdAt) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import { searchApi } from '@/services/mockApi';

const router = useRouter();

// 状态管理
const searchQuery = ref('');
const searchType = ref('');
const isSearching = ref(false);
const searchError = ref('');
const results = ref<any>({
  cases: [],
  reports: [],
});

// 热门搜索关键词
const hotSearches = ref([
  '贷款诈骗',
  '冒充公检法',
  '杀猪盘',
  '虚假投资',
  '冒充客服',
]);

// 计算属性
const hasResults = computed(
  () => results.value.cases.length > 0 || results.value.reports.length > 0
);

// 方法
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }

  isSearching.value = true;
  searchError.value = '';

  try {
    const types = searchType.value ? [searchType.value as any] : undefined;
    const data = await searchApi.search(searchQuery.value, types);
    results.value = data;

    if (!hasResults.value) {
      ElMessage.info('未找到相关内容');
    }
  } catch (error: any) {
    searchError.value = error.message || '搜索失败，请重试';
    ElMessage.error(searchError.value);
  } finally {
    isSearching.value = false;
  }
};

const goCaseDetail = (caseId: string) => {
  router.push(`/cases/${caseId}?from=search`);
};

const goReportDetail = (reportId: string) => {
  router.push(`/report/success?reportId=${reportId}`);
};

const getRiskTagType = (riskLevel: string): any => {
  const map: Record<string, string> = {
    高: 'danger',
    中: 'warning',
    低: 'success',
  };
  return map[riskLevel] || 'info';
};

const getReportTagType = (status: string): any => {
  const map: Record<string, string> = {
    待初审: 'warning',
    处理中: 'info',
    已反馈: 'success',
  };
  return map[status] || 'info';
};

const formatAmount = (amount: number) => {
  if (amount >= 10000) {
    return `¥${(amount / 10000).toFixed(1)}万`;
  }
  return `¥${amount}`;
};

const formatTime = (time: string) => {
  const date = new Date(time);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;

  return date.toLocaleDateString();
};
</script>

<style scoped lang="scss">
.search-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.search-header {
  max-width: 800px;
  margin: 0 auto 60px;

  .search-container {
    margin-bottom: 20px;

    :deep(.el-input) {
      border-radius: 8px;
      --el-input-height: 48px;

      .el-input__wrapper {
        border: none;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        background: white;
      }

      .el-input__inner {
        font-size: 16px;
      }
    }
  }

  .search-filter {
    text-align: center;

    :deep(.el-radio-group) {
      display: flex;
      justify-content: center;
      gap: 20px;

      .el-radio__label {
        color: white;
        font-weight: 500;
      }
    }
  }
}

.search-results {
  max-width: 900px;
  margin: 0 auto;

  .hot-searches {
    background: white;
    padding: 30px;
    border-radius: 8px;
    text-align: center;

    h3 {
      margin: 0 0 20px;
      font-size: 18px;
      color: #333;
    }

    .hot-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;

      :deep(.el-tag) {
        cursor: pointer;
        padding: 8px 16px;
        font-size: 14px;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

.result-section {
  background: white;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 20px;

  h3 {
    font-size: 18px;
    color: #333;
    margin: 0 0 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #667eea;
  }

  .result-items {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .result-item {
    padding: 20px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
    }

    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      gap: 10px;

      h4 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
        flex: 1;
      }

      :deep(.el-tag) {
        white-space: nowrap;
        flex-shrink: 0;
      }
    }

    .item-description {
      margin: 10px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .item-footer {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      font-size: 13px;
      color: #999;

      span {
        white-space: nowrap;
      }
    }
  }

  .case-item {
    .item-header h4 {
      color: #333;
    }
  }

  .report-item {
    .item-header h4 {
      color: #333;
    }
  }
}

:deep(.el-skeleton) {
  background: white;
  padding: 30px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .search-view {
    padding: 20px 15px;
  }

  .search-header {
    margin-bottom: 30px;

    .search-filter {
      :deep(.el-radio-group) {
        gap: 10px;
        flex-wrap: wrap;
      }
    }
  }

  .search-results {
    .hot-searches {
      padding: 20px;

      .hot-tags {
        gap: 8px;

        :deep(.el-tag) {
          font-size: 12px;
          padding: 6px 12px;
        }
      }
    }
  }

  .result-section {
    padding: 20px;

    .result-item {
      padding: 15px;

      .item-header {
        align-items: flex-start;
        flex-wrap: wrap;

        h4 {
          min-width: 0;
          overflow-wrap: anywhere;
        }
      }

      .item-footer {
        gap: 10px;

        span {
          white-space: normal;
          overflow-wrap: anywhere;
        }
      }
    }
  }
}
</style>
