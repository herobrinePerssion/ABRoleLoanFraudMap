<template>
  <div class="profile-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
      <h1>个人中心</h1>
      <p class="subtitle">管理您的举报和反馈</p>
    </div>

    <!-- 个人信息卡片 -->
    <div class="profile-container">
      <el-row :gutter="20">
        <!-- 用户统计卡片 -->
        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon reports-icon">📋</div>
            <div class="stat-content">
              <p class="stat-label">我的举报</p>
              <p class="stat-number">{{ reportStats.total }}</p>
              <span class="stat-detail">{{ reportStats.pending }} 待处理</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon feedback-icon">💬</div>
            <div class="stat-content">
              <p class="stat-label">我的反馈</p>
              <p class="stat-number">{{ feedbackStats.total }}</p>
              <span class="stat-detail">{{ feedbackStats.pending }} 待回复</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon quiz-icon">🧠</div>
            <div class="stat-content">
              <p class="stat-label">防骗自测</p>
              <p class="stat-number">{{ quizStats.completed }}</p>
              <span class="stat-detail">已完成次数</span>
            </div>
          </div>
        </el-col>

        <el-col :xs="24" :sm="12" :md="6">
          <div class="stat-card">
            <div class="stat-icon contribution-icon">⭐</div>
            <div class="stat-content">
              <p class="stat-label">贡献度</p>
              <p class="stat-number">{{ contributionScore }}</p>
              <span class="stat-detail">社区等级</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 标签页内容 -->
    <div class="content-container">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- 我的举报 -->
        <el-tab-pane label="我的举报" name="reports">
          <div class="tab-content">
            <div class="filter-bar">
              <el-select
                v-model="reportFilter"
                placeholder="筛选状态"
                clearable
                @change="loadReports"
              >
                <el-option label="全部" value="" />
                <el-option label="待初审" value="待初审" />
                <el-option label="处理中" value="处理中" />
                <el-option label="已反馈" value="已反馈" />
              </el-select>
            </div>

            <LoadingSpinner v-if="isLoadingReports" />

            <EmptyState
              v-else-if="reports.length === 0"
              title="还没有举报记录"
              description="您的每一条举报都对我们很重要，一起守护网络安全"
              actionText="去举报"
              @action="$router.push('/report')"
            />

            <div v-else class="report-list">
              <div v-for="report in reports" :key="report.reportId" class="report-card">
                <div class="card-header">
                  <div>
                    <h4>{{ report.title }}</h4>
                    <p class="report-id">举报ID: {{ report.reportId }}</p>
                  </div>
                  <el-tag :type="getReportTagType(report.status)">
                    {{ report.status }}
                  </el-tag>
                </div>

                <p class="description">{{ report.description }}</p>

                <div class="card-footer">
                  <span class="time">📅 {{ formatDate(report.createdAt) }}</span>
                  <el-button
                    v-if="report.status !== '待初审'"
                    type="text"
                    size="small"
                    @click="viewReportDetail(report.reportId)"
                  >
                    查看详情
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 我的反馈 -->
        <el-tab-pane label="我的反馈" name="feedbacks">
          <div class="tab-content">
            <div class="filter-bar">
              <el-select
                v-model="feedbackFilter"
                placeholder="筛选类型"
                clearable
                @change="loadFeedbacks"
              >
                <el-option label="全部" value="" />
                <el-option label="问题报告" value="bug" />
                <el-option label="功能建议" value="feature" />
                <el-option label="其他反馈" value="feedback" />
              </el-select>
            </div>

            <LoadingSpinner v-if="isLoadingFeedbacks" />

            <EmptyState
              v-else-if="feedbacks.length === 0"
              title="还没有反馈记录"
              description="我们很重视您的意见，欢迎分享想法"
              actionText="去提交反馈"
              @action="$router.push('/feedback')"
            />

            <div v-else class="feedback-list">
              <div v-for="feedback in feedbacks" :key="feedback.feedbackId" class="feedback-card">
                <div class="card-header">
                  <div>
                    <h4>{{ feedback.title }}</h4>
                    <p class="feedback-id">反馈ID: {{ feedback.feedbackId }}</p>
                  </div>
                  <el-tag :type="getFeedbackTagType(feedback.type)">
                    {{ getFeedbackTypeName(feedback.type) }}
                  </el-tag>
                </div>

                <p class="description">{{ feedback.description }}</p>

                <div class="card-footer">
                  <span class="time">📅 {{ formatDate(feedback.createdAt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全设置" name="security">
          <div class="tab-content security-settings">
            <el-form label-width="120px">
              <el-form-item label="账户隐私">
                <el-switch v-model="settings.privateAccount" />
                <span class="setting-help">隐藏个人举报和反馈记录</span>
              </el-form-item>

              <el-form-item label="邮件通知">
                <el-switch v-model="settings.emailNotification" />
                <span class="setting-help">当举报或反馈有更新时通知我</span>
              </el-form-item>

              <el-form-item label="数据删除">
                <el-popconfirm
                  title="确认删除所有个人数据?"
                  description="此操作不可恢复，将删除所有举报和反馈记录"
                  @confirm="deleteAllData"
                >
                  <template #reference>
                    <el-button type="danger">删除所有数据</el-button>
                  </template>
                </el-popconfirm>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" @click="saveSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import EmptyState from '@/components/EmptyState.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { reportApi, feedbackApi } from '@/services/mockApi';

// 状态管理
const activeTab = ref('reports');
const isLoadingReports = ref(false);
const isLoadingFeedbacks = ref(false);
const reportFilter = ref('');
const feedbackFilter = ref('');

// 数据列表
const reports = ref<any[]>([]);
const feedbacks = ref<any[]>([]);

// 统计数据
const reportStats = reactive({
  total: 0,
  pending: 0,
});

const feedbackStats = reactive({
  total: 0,
  pending: 0,
});

const quizStats = reactive({
  completed: JSON.parse(localStorage.getItem('quizStats') || '{"completed": 0}').completed,
});

// 贡献度计算
const contributionScore = ref(
  Math.min(100, (reportStats.total + feedbackStats.total * 0.5) * 10)
);

// 安全设置
const settings = reactive({
  privateAccount: false,
  emailNotification: true,
});

// 方法
const loadReports = async () => {
  isLoadingReports.value = true;
  try {
    const data = await reportApi.getMyReports();
    let filtered = data.items;

    if (reportFilter.value) {
      filtered = filtered.filter((r) => r.status === reportFilter.value);
    }

    reports.value = filtered;
    reportStats.total = data.total;
    reportStats.pending = data.items.filter((r) => r.status === '待初审').length;
  } catch (error: any) {
    ElMessage.error('加载举报列表失败');
  } finally {
    isLoadingReports.value = false;
  }
};

const loadFeedbacks = async () => {
  isLoadingFeedbacks.value = true;
  try {
    const data = await feedbackApi.getFeedbacks(feedbackFilter.value || undefined);
    feedbacks.value = data;
    feedbackStats.total = data.length;
    feedbackStats.pending = data.filter((f) => !f.status || f.status === 'received').length;
  } catch (error: any) {
    ElMessage.error('加载反馈列表失败');
  } finally {
    isLoadingFeedbacks.value = false;
  }
};

const viewReportDetail = (reportId: string) => {
  const report = reports.value.find((r) => r.reportId === reportId);
  if (report) {
    ElMessageBox.alert(
      `
      <div style="text-align: left;">
        <p><strong>举报ID:</strong> ${report.reportId}</p>
        <p><strong>状态:</strong> ${report.status}</p>
        <p><strong>描述:</strong> ${report.description}</p>
        <p><strong>提交时间:</strong> ${formatDate(report.createdAt)}</p>
        ${report.feedback ? `<p><strong>反馈:</strong> ${report.feedback}</p>` : ''}
      </div>
      `,
      '举报详情',
      {
        dangerouslyUseHTMLString: true,
      }
    );
  }
};

const saveSettings = () => {
  localStorage.setItem('userSettings', JSON.stringify(settings));
  ElMessage.success('设置已保存');
};

const deleteAllData = async () => {
  localStorage.removeItem('reports');
  localStorage.removeItem('feedbacks');
  reports.value = [];
  feedbacks.value = [];
  reportStats.total = 0;
  reportStats.pending = 0;
  feedbackStats.total = 0;
  feedbackStats.pending = 0;
  ElMessage.success('数据已删除');
};

const getReportTagType = (status: string): any => {
  const map: Record<string, string> = {
    待初审: 'warning',
    处理中: 'info',
    已反馈: 'success',
  };
  return map[status] || 'info';
};

const getFeedbackTagType = (type: string): any => {
  const map: Record<string, string> = {
    bug: 'danger',
    feature: 'success',
    feedback: 'warning',
  };
  return map[type] || 'info';
};

const getFeedbackTypeName = (type: string) => {
  const map: Record<string, string> = {
    bug: '问题报告',
    feature: '功能建议',
    feedback: '其他反馈',
  };
  return map[type] || '反馈';
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN');
};

// 初始化
loadReports();
loadFeedbacks();
</script>

<style scoped lang="scss">
.profile-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    color: white;
    margin: 15px 0;
  }

  .subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto 40px;

  .stat-card {
    display: flex;
    gap: 16px;
    padding: 24px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .stat-content {
      flex: 1;

      .stat-label {
        margin: 0;
        font-size: 14px;
        color: #666;
      }

      .stat-number {
        margin: 8px 0;
        font-size: 28px;
        font-weight: 600;
        color: #333;
      }

      .stat-detail {
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);

  :deep(.el-tabs__header) {
    border-bottom: 2px solid #f0f0f0;
    margin-bottom: 30px;
  }

  :deep(.el-tabs__item) {
    font-size: 16px;
    font-weight: 500;

    &.is-active {
      color: #667eea;
      border-bottom-color: #667eea;
    }
  }
}

.tab-content {
  padding: 20px 0;

  .filter-bar {
    margin-bottom: 20px;

    :deep(.el-select) {
      width: 200px;
    }
  }
}

.report-list,
.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .report-card,
  .feedback-card {
    padding: 20px;
    border: 1px solid #e6e6e6;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      border-color: #667eea;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
      gap: 16px;

      h4 {
        margin: 0;
        font-size: 16px;
        color: #333;
      }

      .report-id,
      .feedback-id {
        margin: 4px 0 0;
        font-size: 12px;
        color: #999;
      }
    }

    .description {
      margin: 12px 0;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
      font-size: 13px;
      color: #999;
    }
  }
}

.security-settings {
  max-width: 600px;

  :deep(.el-form) {
    .el-form-item {
      margin-bottom: 24px;

      .setting-help {
        margin-left: 12px;
        font-size: 12px;
        color: #999;
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-view {
    padding: 20px 15px;
  }

  .page-header {
    h1 {
      font-size: 24px;
    }
  }

  .profile-container {
    .stat-card {
      padding: 16px;
      flex-direction: column;
      text-align: center;

      .stat-icon {
        font-size: 36px;
      }

      .stat-number {
        font-size: 24px;
      }
    }
  }

  .content-container {
    padding: 20px;

    :deep(.el-tabs__item) {
      font-size: 14px;
    }
  }

  .filter-bar {
    :deep(.el-select) {
      width: 100%;
    }
  }
}
</style>
