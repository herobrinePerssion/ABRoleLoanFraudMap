<template>
  <div class="feedback-view">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户反馈</el-breadcrumb-item>
      </el-breadcrumb>
      <h1>用户反馈</h1>
      <p class="subtitle">我们很重视您的意见，您的建议将帮助我们做得更好</p>
    </div>

    <!-- 反馈内容区 -->
    <div class="feedback-container">
      <!-- 反馈选项卡 -->
      <el-tabs v-model="activeTab" class="feedback-tabs">
        <!-- 提交反馈标签页 -->
        <el-tab-pane label="提交反馈" name="submit">
          <div class="form-section">
            <el-form
              ref="formRef"
              :model="feedbackForm"
              :rules="rules"
              label-width="80px"
              class="feedback-form"
            >
              <!-- 反馈类型 -->
              <el-form-item label="反馈类型" prop="type">
                <el-radio-group v-model="feedbackForm.type">
                  <el-radio value="bug">
                    <span class="radio-label">
                      <el-icon><Warning /></el-icon>
                      问题报告
                    </span>
                  </el-radio>
                  <el-radio value="feature">
                    <span class="radio-label">
                      <el-icon><CirclePlus /></el-icon>
                      功能建议
                    </span>
                  </el-radio>
                  <el-radio value="feedback">
                    <span class="radio-label">
                      <el-icon><Message /></el-icon>
                      其他反馈
                    </span>
                  </el-radio>
                </el-radio-group>
              </el-form-item>

              <!-- 反馈标题 -->
              <el-form-item label="标题" prop="title">
                <el-input
                  v-model="feedbackForm.title"
                  placeholder="简明扼要地描述您的反馈"
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>

              <!-- 反馈内容 -->
              <el-form-item label="描述" prop="description">
                <el-input
                  v-model="feedbackForm.description"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细描述您的反馈内容，越详细越有帮助&#10;- 遇到的问题&#10;- 期望的功能&#10;- 改进建议"
                  maxlength="1000"
                  show-word-limit
                />
              </el-form-item>

              <!-- 联系方式 -->
              <el-form-item label="联系方式" prop="email">
                <el-input
                  v-model="feedbackForm.email"
                  type="email"
                  placeholder="邮箱地址（可选，便于我们跟进反馈）"
                />
              </el-form-item>

              <!-- 附加信息 -->
              <el-form-item label="相关案例">
                <el-select
                  v-model="feedbackForm.relatedCaseId"
                  placeholder="如反馈与某个案例相关，请选择（可选）"
                  clearable
                >
                  <el-option
                    v-for="caseItem in availableCases"
                    :key="caseItem.id"
                    :label="`${caseItem.title} (${caseItem.region})`"
                    :value="caseItem.id"
                  />
                </el-select>
              </el-form-item>

              <!-- 操作按钮 -->
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="isSubmitting"
                  @click="submitFeedback(formRef)"
                >
                  {{ isSubmitting ? '提交中...' : '提交反馈' }}
                </el-button>
                <el-button @click="resetForm(formRef)">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <!-- 我的反馈标签页 -->
        <el-tab-pane label="我的反馈" name="history">
          <div class="history-section">
            <!-- 过滤选项 -->
            <div class="filter-bar">
              <el-select
                v-model="filterType"
                placeholder="筛选类型"
                clearable
                @change="loadMyFeedbacks"
              >
                <el-option label="全部" value="" />
                <el-option label="问题报告" value="bug" />
                <el-option label="功能建议" value="feature" />
                <el-option label="其他反馈" value="feedback" />
              </el-select>
            </div>

            <!-- 加载态 -->
            <el-skeleton v-if="isLoadingHistory" :rows="3" animated />

            <!-- 空状态 -->
            <EmptyState
              v-else-if="myFeedbacks.length === 0"
              title="还没有提交过反馈"
              description="您的每一条反馈都很重要，欢迎分享您的想法"
              actionText="去提交反馈"
              @action="activeTab = 'submit'"
            />

            <!-- 反馈列表 -->
            <div v-else class="feedback-list">
              <div
                v-for="item in myFeedbacks"
                :key="item.feedbackId"
                class="feedback-card"
              >
                <div class="card-header">
                  <div class="title-section">
                    <el-tag :type="getFeedbackTagType(item.type)">
                      {{ getFeedbackTypeName(item.type) }}
                    </el-tag>
                    <h4>{{ item.title }}</h4>
                  </div>
                  <span class="time">{{ formatTime(item.createdAt) }}</span>
                </div>

                <p class="description">{{ item.description }}</p>

                <div class="card-footer">
                  <span class="status">
                    状态：
                    <el-tag type="info">{{ item.status || '待处理' }}</el-tag>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- FAQ标签页 -->
        <el-tab-pane label="常见问题" name="faq">
          <div class="faq-section">
            <el-collapse>
              <el-collapse-item
                v-for="faq in faqs"
                :key="faq.id"
                :title="faq.question"
                :name="faq.id"
              >
                <div class="faq-content">{{ faq.answer }}</div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus';
import { Warning, CirclePlus, Message } from '@element-plus/icons-vue';
import EmptyState from '@/components/EmptyState.vue';
import { feedbackApi } from '@/services/mockApi';
import { FRAUD_CASES } from '@/constants/cases';

// 状态管理
const activeTab = ref('submit');
const isSubmitting = ref(false);
const isLoadingHistory = ref(false);
const filterType = ref('');
const formRef = ref<FormInstance>();

// 表单数据
const feedbackForm = ref({
  type: 'feedback',
  title: '',
  description: '',
  email: '',
  relatedCaseId: '',
});

// 我的反馈列表
const myFeedbacks = ref<any[]>([]);

// 表单验证规则
const rules = {
  type: [{ required: true, message: '请选择反馈类型', trigger: 'change' }],
  title: [
    { required: true, message: '请输入反馈标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度 5-100 字符', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请输入反馈内容', trigger: 'blur' },
    { min: 20, max: 1000, message: '描述长度 20-1000 字符', trigger: 'blur' },
  ],
  email: [
    {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '请输入有效的邮箱地址',
      trigger: 'blur',
    },
  ],
};

// FAQ 数据
const faqs = ref([
  {
    id: '1',
    question: '反馈多久会得到回复？',
    answer:
      '我们承诺在 7 个工作日内回复所有反馈。对于紧急的问题报告，我们会优先处理。您可以在"我的反馈"页面追踪反馈状态。',
  },
  {
    id: '2',
    question: '如何联系技术支持？',
    answer:
      '您可以通过以下方式联系我们：1. 在反馈表单中填写邮箱地址，我们会主动回复；2. 在"我的反馈"页面查看反馈状态；3. 查看帮助中心了解更多信息。',
  },
  {
    id: '3',
    question: '我的反馈会被泄露吗？',
    answer:
      '不会。我们严格遵守隐私政策，您的个人信息和反馈内容只用于改进服务，不会分享给第三方。详细信息请查看隐私声明。',
  },
  {
    id: '4',
    question: '如何提交一个有效的反馈？',
    answer:
      '一个好的反馈应该包含：标题清晰、描述详细、环境信息完整。对于问题报告，请说明发生时间和重现步骤；对于功能建议，请说明使用场景和期望效果。',
  },
  {
    id: '5',
    question: '能否追踪反馈的处理进度？',
    answer:
      '可以！在"我的反馈"标签页，您可以看到所有已提交反馈的当前状态。我们会定期更新反馈状态，从"待处理"到"处理中"再到"已完成"。',
  },
  {
    id: '6',
    question: '反馈对产品有什么影响？',
    answer:
      '您的反馈非常重要！我们会定期分析所有用户反馈，作为产品改进和功能优化的重要参考。高价值的反馈还可能被列入下个版本的开发计划。',
  },
]);

// 计算属性
const availableCases = computed(() => FRAUD_CASES.slice(0, 10));

// 方法
const submitFeedback = async (form: FormInstance | undefined) => {
  if (!form) return;

  await form.validate(async (valid) => {
    if (!valid) return;

    isSubmitting.value = true;
    try {
      const result = await feedbackApi.submitFeedback({
        type: feedbackForm.value.type as 'bug' | 'feature' | 'feedback',
        title: feedbackForm.value.title,
        description: feedbackForm.value.description,
        email: feedbackForm.value.email || undefined,
      });

      ElMessage.success('反馈提交成功！感谢您的建议');
      resetForm(form);

      // 延迟切换到历史记录
      setTimeout(() => {
        activeTab.value = 'history';
        loadMyFeedbacks();
      }, 500);
    } catch (error: any) {
      ElMessage.error(error.message || '提交失败，请重试');
    } finally {
      isSubmitting.value = false;
    }
  });
};

const resetForm = (form: FormInstance | undefined) => {
  if (!form) return;
  form.resetFields();
  feedbackForm.value = {
    type: 'feedback',
    title: '',
    description: '',
    email: '',
    relatedCaseId: '',
  };
};

const loadMyFeedbacks = async () => {
  isLoadingHistory.value = true;
  try {
    const data = await feedbackApi.getFeedbacks(filterType.value || undefined);
    myFeedbacks.value = data;
  } catch (error: any) {
    ElMessage.error('加载反馈列表失败');
  } finally {
    isLoadingHistory.value = false;
  }
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

// 初始化
loadMyFeedbacks();
</script>

<style scoped lang="scss">
.feedback-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
}

.page-header {
  max-width: 1000px;
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

.feedback-container {
  max-width: 1000px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

  :deep(.el-tabs) {
    .el-tabs__header {
      border-bottom: 2px solid #f0f0f0;
      margin-bottom: 30px;
    }

    .el-tabs__nav-wrap {
      padding-bottom: 8px;

      .el-tabs__nav {
        border: none;
      }

      .el-tabs__item {
        font-size: 16px;
        font-weight: 500;
        color: #666;
        border-bottom: 3px solid transparent;
        padding: 12px 24px;
        transition: all 0.3s;

        &:hover {
          color: #409eff;
        }

        &.is-active {
          color: #409eff;
          border-bottom-color: #409eff;
        }
      }
    }
  }
}

.form-section {
  padding: 20px 0;

  .feedback-form {
    :deep(.el-form-item) {
      margin-bottom: 24px;

      .el-form-item__label {
        font-weight: 500;
        color: #333;
      }
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 8px;

      .el-icon {
        font-size: 18px;
      }
    }

    :deep(.el-button) {
      min-width: 120px;
      font-weight: 500;
    }
  }
}

.history-section {
  padding: 20px 0;

  .filter-bar {
    margin-bottom: 30px;
    display: flex;
    gap: 15px;

    :deep(.el-select) {
      width: 200px;
    }
  }

  .feedback-list {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .feedback-card {
      padding: 20px;
      border: 1px solid #e6e6e6;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
        gap: 20px;

        .title-section {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          :deep(.el-tag) {
            flex-shrink: 0;
          }

          h4 {
            margin: 0;
            font-size: 16px;
            color: #333;
            word-break: break-word;
          }
        }

        .time {
          font-size: 13px;
          color: #999;
          white-space: nowrap;
          flex-shrink: 0;
        }
      }

      .description {
        margin: 0 0 15px;
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }

      .card-footer {
        padding-top: 15px;
        border-top: 1px solid #f0f0f0;
        font-size: 13px;

        .status {
          display: flex;
          align-items: center;
          gap: 8px;
        }
      }
    }
  }
}

.faq-section {
  padding: 20px 0;

  :deep(.el-collapse) {
    border: 1px solid #e6e6e6;
    border-radius: 8px;

    .el-collapse-item {
      &:not(:last-child) {
        border-bottom: 1px solid #e6e6e6;
      }

      .el-collapse-item__header {
        padding: 20px;
        font-size: 15px;
        font-weight: 500;
        color: #333;
        background: #fafafa;

        &:hover {
          background: #f0f0f0;
        }
      }

      .el-collapse-item__content {
        padding: 20px;
        background: white;
      }
    }
  }

  .faq-content {
    font-size: 14px;
    color: #666;
    line-height: 1.8;
  }
}

@media (max-width: 768px) {
  .feedback-view {
    padding: 20px 15px;
  }

  .page-header {
    h1 {
      font-size: 24px;
    }

    .subtitle {
      font-size: 14px;
    }
  }

  .feedback-container {
    padding: 20px;

    :deep(.el-tabs__nav-wrap) {
      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    :deep(.el-tabs__nav-wrap) {
      .el-tabs__item {
        font-size: 14px;
        padding: 10px 16px;
      }
    }
  }

  .history-section {
    .filter-bar {
      flex-direction: column;

      :deep(.el-select) {
        width: 100%;
      }
    }
  }

  .form-section {
    .feedback-form {
      :deep(.el-form-item) {
        display: block;
      }

      :deep(.el-form-item__label) {
        display: block;
        width: 100% !important;
        margin-bottom: 6px;
        justify-content: flex-start;
        text-align: left;
      }

      :deep(.el-radio-group) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }

      :deep(.el-select),
      :deep(.el-button) {
        width: 100%;
      }

      :deep(.el-button + .el-button) {
        margin-top: 10px;
      }
    }
  }

  .history-section {
    .feedback-list {
      .feedback-card {
        padding: 15px;

        .card-header,
        .title-section {
          align-items: flex-start;
          flex-direction: column;
          gap: 10px;
        }

        .time,
        h4 {
          white-space: normal;
          overflow-wrap: anywhere;
        }
      }
    }
  }

  .faq-section {
    :deep(.el-collapse-item) {
      .el-collapse-item__header {
        padding: 15px;
        font-size: 14px;
      }

      .el-collapse-item__content {
        padding: 15px;
      }
    }
  }
}
</style>
