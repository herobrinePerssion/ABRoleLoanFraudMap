<template>
  <el-main class="quiz-page">
    <el-page-header content="防骗自测" />

    <el-card shadow="hover" class="intro-card">
      <template #header>
        <div class="card-title">3 分钟识别 AB 贷风险</div>
      </template>
      <p class="intro-desc">
        根据你的选择，系统会给出风险等级与防护建议。本测评仅用于反诈科普，不构成法律或金融建议。
      </p>
      <el-progress :percentage="progress" :stroke-width="12" />
      <div class="progress-text">已完成 {{ answeredCount }}/{{ questions.length }} 题</div>
    </el-card>

    <el-card shadow="never" class="question-card">
      <div v-for="(question, index) in questions" :key="question.id" class="question-item">
        <div class="question-title">{{ index + 1 }}. {{ question.title }}</div>
        <el-radio-group v-model="answers[question.id]" class="option-group">
          <el-radio
            v-for="option in question.options"
            :key="option.label"
            :label="option.label"
            border
            class="option-item"
          >
            {{ option.text }}
          </el-radio>
        </el-radio-group>
      </div>

      <el-space>
        <el-button type="primary" :disabled="!allAnswered" @click="submitQuiz">生成评估结果</el-button>
        <el-button @click="resetQuiz">重置答题</el-button>
      </el-space>
    </el-card>

    <el-card v-if="result" shadow="hover" class="result-card">
      <template #header>
        <div class="card-title">评估结果</div>
      </template>

      <el-alert :title="result.title" :type="result.alertType" show-icon :closable="false" />

      <el-descriptions :column="1" border class="result-desc">
        <el-descriptions-item label="风险等级">{{ result.level }}</el-descriptions-item>
        <el-descriptions-item label="风险分值">{{ totalScore }} / {{ maxScore }}</el-descriptions-item>
        <el-descriptions-item label="行动建议">
          <ul class="suggest-list">
            <li v-for="(item, idx) in result.suggestions" :key="idx">{{ item }}</li>
          </ul>
        </el-descriptions-item>
      </el-descriptions>

      <el-space>
        <el-button type="primary" @click="goReport">立即举报线索</el-button>
        <el-button @click="goAbout">查看 AB 贷说明</el-button>
      </el-space>
    </el-card>
  </el-main>
</template>

<script setup lang="ts">
interface QuizOption {
  label: string
  text: string
  score: number
}

interface QuizQuestion {
  id: number
  title: string
  options: QuizOption[]
}

const router = useRouter()

const questions: QuizQuestion[] = [
  {
    id: 1,
    title: '对方要求“放款前先交保证金/解冻金”时，你会？',
    options: [
      { label: 'A', text: '先转一小笔试试', score: 3 },
      { label: 'B', text: '要求提供正规机构证明再判断', score: 2 },
      { label: 'C', text: '直接拒绝并保留证据', score: 0 },
    ],
  },
  {
    id: 2,
    title: '对方催促你“立刻操作，不然名额失效”时，你会？',
    options: [
      { label: 'A', text: '按其要求马上操作', score: 3 },
      { label: 'B', text: '先拖延并咨询家人', score: 1 },
      { label: 'C', text: '中止沟通并核验渠道', score: 0 },
    ],
  },
  {
    id: 3,
    title: '客服让你开启屏幕共享/远程控制手机时，你会？',
    options: [
      { label: 'A', text: '为了放款配合操作', score: 3 },
      { label: 'B', text: '只共享部分页面', score: 2 },
      { label: 'C', text: '拒绝并拉黑', score: 0 },
    ],
  },
  {
    id: 4,
    title: '对方要求提供短信验证码时，你会？',
    options: [
      { label: 'A', text: '提供验证码加快流程', score: 3 },
      { label: 'B', text: '询问用途后再决定', score: 2 },
      { label: 'C', text: '绝不提供验证码', score: 0 },
    ],
  },
  {
    id: 5,
    title: '遇到“征信修复包过贷”的宣传时，你更可能？',
    options: [
      { label: 'A', text: '尝试付费修复', score: 3 },
      { label: 'B', text: '先看评价再决定', score: 2 },
      { label: 'C', text: '判断为高风险并远离', score: 0 },
    ],
  },
]

const answers = reactive<Record<number, string>>({})
const result = ref<null | {
  level: string
  title: string
  alertType: 'success' | 'warning' | 'error'
  suggestions: string[]
}>(null)
const totalScore = ref(0)

const answeredCount = computed(() => {
  return questions.filter(question => Boolean(answers[question.id])).length
})

const progress = computed(() => {
  return Math.round((answeredCount.value / questions.length) * 100)
})

const allAnswered = computed(() => answeredCount.value === questions.length)

const maxScore = computed(() => questions.length * 3)

function submitQuiz() {
  if (!allAnswered.value) {
    ElMessage.warning('请先完成全部题目')
    return
  }

  const score = questions.reduce((sum, question) => {
    const selected = answers[question.id]
    const option = question.options.find(item => item.label === selected)
    return sum + (option?.score || 0)
  }, 0)

  totalScore.value = score

  if (score >= 10) {
    result.value = {
      level: '高风险',
      title: '你当前受骗风险较高，请立即提高警惕',
      alertType: 'error',
      suggestions: [
        '停止向陌生账户转账，尤其是“放款前收费”情形',
        '不要提供验证码、银行卡密码、远程控制权限',
        '保留聊天、转账、合同等证据并及时举报',
      ],
    }
    return
  }

  if (score >= 5) {
    result.value = {
      level: '中风险',
      title: '你存在一定风险暴露，建议立即优化防骗习惯',
      alertType: 'warning',
      suggestions: [
        '任何贷款前收费行为都应视为高风险',
        '遇到催促转账时，至少冷静 10 分钟再决策',
        '优先通过官方渠道核验机构资质',
      ],
    }
    return
  }

  result.value = {
    level: '低风险',
    title: '你的防骗意识较好，请继续保持',
    alertType: 'success',
    suggestions: [
      '持续关注最新反诈案例与官方预警',
      '提醒身边亲友警惕“先收费再放款”套路',
      '如遇可疑情况，第一时间保存证据并咨询警方',
    ],
  }
}

function resetQuiz() {
  questions.forEach((question) => {
    delete answers[question.id]
  })
  totalScore.value = 0
  result.value = null
}

function goReport() {
  router.push('/report')
}

function goAbout() {
  router.push('/about')
}
</script>

<style lang="scss" scoped>
.quiz-page {
  padding: 0 20px 20px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.intro-card {
  margin-bottom: 14px;
}

.intro-desc {
  margin: 0 0 10px;
  color: #606266;
}

.progress-text {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.question-card {
  margin-bottom: 14px;
}

.question-item + .question-item {
  margin-top: 16px;
}

.question-title {
  margin-bottom: 10px;
  font-weight: 600;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  margin-right: 0;
}

.result-desc {
  margin: 14px 0;
}

.suggest-list {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 6px;
  }
}

@media (max-width: 992px) {
  .quiz-page {
    padding: 0 12px 16px;
  }
}
</style>
