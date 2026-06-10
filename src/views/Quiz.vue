<template>
  <el-main class="quiz-page">
    <el-page-header content="AB贷风险自测" />

    <el-card shadow="hover" class="intro-card">
      <template #header>
        <div class="card-title">13题拆解 AB贷骗局执行链路</div>
      </template>
      <p class="intro-desc">
        这套自测按 AB贷常见实施顺序设计：先找急需资金的A，再找征信较好的B，随后用“担保人、监管人、紧急联系人、转名”等话术包装，最后完成签约、放款、转账和抽佣。你可以顺着题目判断自己处在哪个风险阶段。
      </p>
      <el-progress :percentage="progress" :stroke-width="12" />
      <div class="progress-text">已完成 {{ answeredCount }}/{{ questions.length }} 题</div>
    </el-card>

    <el-card shadow="never" class="question-card">
      <section v-for="group in groupedQuestions" :key="group.stage" class="stage-block">
        <div class="stage-head">
          <el-tag effect="dark">{{ group.stage }}</el-tag>
          <span>{{ group.desc }}</span>
        </div>

        <div v-for="question in group.items" :key="question.id" class="question-item">
          <div class="question-title">{{ question.id }}. {{ question.title }}</div>
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
      </section>

      <el-space wrap>
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
        <el-descriptions-item label="当前判断">{{ result.diagnosis }}</el-descriptions-item>
        <el-descriptions-item label="行动建议">
          <ul class="suggest-list">
            <li v-for="(item, idx) in result.suggestions" :key="idx">{{ item }}</li>
          </ul>
        </el-descriptions-item>
      </el-descriptions>

      <el-space wrap>
        <el-button type="primary" @click="goReport">举报非法中介线索</el-button>
        <el-button @click="goCases">查看公开案例</el-button>
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
  stage: string
  stageDesc: string
  title: string
  options: QuizOption[]
}

interface QuizGroup {
  stage: string
  desc: string
  items: QuizQuestion[]
}

const router = useRouter()

const questions: QuizQuestion[] = [
  {
    id: 1,
    stage: '第一步：寻找A',
    stageDesc: '黑中介先锁定急需资金、征信不足的人。',
    title: '有人宣传“征信差、负债高、被拒贷也能办”，你会怎么判断？',
    options: [
      { label: 'A', text: '急着用钱，先加微信了解方案', score: 3 },
      { label: 'B', text: '先听听对方怎么包装资质', score: 2 },
      { label: 'C', text: '判断为非法助贷高危广告，拒绝接触', score: 0 },
    ],
  },
  {
    id: 2,
    stage: '第一步：寻找A',
    stageDesc: '黑中介会把“办不下来”解释成需要找B配合。',
    title: '中介说“A资质不够，需要找征信好的亲友帮忙走流程”，你会？',
    options: [
      { label: 'A', text: '马上找亲友帮忙', score: 3 },
      { label: 'B', text: '找亲友咨询，但不说清楚真实风险', score: 2 },
      { label: 'C', text: '停止办理，因为这已经接近AB贷结构', score: 0 },
    ],
  },
  {
    id: 3,
    stage: '第二步：寻找B',
    stageDesc: 'B通常被熟人关系、人情压力或“只是帮忙”话术拉进流程。',
    title: '亲友请求你“只是做担保/紧急联系人，不用还款”，你会？',
    options: [
      { label: 'A', text: '相信亲友，愿意配合签字刷脸', score: 3 },
      { label: 'B', text: '要求对方写承诺书后配合', score: 2 },
      { label: 'C', text: '拒绝用本人身份参与他人贷款', score: 0 },
    ],
  },
  {
    id: 4,
    stage: '第二步：寻找B',
    stageDesc: '黑中介会弱化B的法律责任。',
    title: '中介说“你只是监管人，贷款后6个月转到A名下，不影响征信”，你会？',
    options: [
      { label: 'A', text: '相信中介有内部渠道', score: 3 },
      { label: 'B', text: '让中介出具保证后继续', score: 2 },
      { label: 'C', text: '识别为典型AB贷话术，拒绝继续', score: 0 },
    ],
  },
  {
    id: 5,
    stage: '第三步：包装资质',
    stageDesc: '进入办理环节后，中介开始收集B的身份、征信和账户控制信息。',
    title: '对方要求B提供身份证、银行卡、征信报告、人脸识别和验证码，你会？',
    options: [
      { label: 'A', text: '全部提供，方便对方代办', score: 3 },
      { label: 'B', text: '只提供部分材料，验证码暂时保留', score: 2 },
      { label: 'C', text: '拒绝交出身份和账户控制权', score: 0 },
    ],
  },
  {
    id: 6,
    stage: '第三步：包装资质',
    stageDesc: '中介可能让B按指定话术回答银行或金融机构。',
    title: '中介教你统一口径：“这笔钱是你自己经营周转用”，你会？',
    options: [
      { label: 'A', text: '按话术回答，避免贷款被拒', score: 3 },
      { label: 'B', text: '含糊回答，不主动说资金给A用', score: 2 },
      { label: 'C', text: '如实说明资金用途并停止配合', score: 0 },
    ],
  },
  {
    id: 7,
    stage: '第四步：签约面审',
    stageDesc: '真正的合同借款人往往在这一步被确定。',
    title: '合同、APP或面签页面显示借款人是B本人，但资金实际给A使用，你会？',
    options: [
      { label: 'A', text: '只要A承诺还款，就继续签', score: 3 },
      { label: 'B', text: '让A补一张借条后继续签', score: 2 },
      { label: 'C', text: '立即停止，因为法律借款人可能就是B', score: 0 },
    ],
  },
  {
    id: 8,
    stage: '第四步：签约面审',
    stageDesc: '黑中介会用速度和人情压力压缩B的判断时间。',
    title: '中介和A催促“窗口期快过了，现在不签就办不下来”，你会？',
    options: [
      { label: 'A', text: '赶紧完成流程', score: 3 },
      { label: 'B', text: '先签一部分，回头再看合同', score: 2 },
      { label: 'C', text: '暂停，带走合同核对并联系官方客服确认', score: 0 },
    ],
  },
  {
    id: 9,
    stage: '第五步：放款转账',
    stageDesc: '贷款到账后，黑中介会推动资金离开B账户。',
    title: '贷款到账到B账户后，对方要求马上转给A或中介“代管/过账”，你会？',
    options: [
      { label: 'A', text: '马上转出，反正不是自己用', score: 3 },
      { label: 'B', text: '写清备注后转出', score: 2 },
      { label: 'C', text: '不转出，并联系放款机构说明异常', score: 0 },
    ],
  },
  {
    id: 10,
    stage: '第五步：放款转账',
    stageDesc: '黑中介常在放款后抽取高额服务费。',
    title: '中介要求从贷款里扣20%-40%“服务费/渠道费/包装费”，你会？',
    options: [
      { label: 'A', text: '同意扣费，只要能拿到钱', score: 3 },
      { label: 'B', text: '讨价还价后支付一部分', score: 2 },
      { label: 'C', text: '拒绝支付并保留收费证据举报', score: 0 },
    ],
  },
  {
    id: 11,
    stage: '第六步：风险暴露',
    stageDesc: 'A断供、失联或中介跑路后，B开始承受还款和征信压力。',
    title: 'A开始逾期，中介说“别接催收电话，我们会处理”，你会？',
    options: [
      { label: 'A', text: '继续等中介处理', score: 3 },
      { label: 'B', text: '只催A还款，不联系金融机构', score: 2 },
      { label: 'C', text: '立即联系放款机构、报警并固定证据', score: 0 },
    ],
  },
  {
    id: 12,
    stage: '第六步：风险暴露',
    stageDesc: '黑中介可能继续用“转名、修复征信、协商延期”二次收费。',
    title: '中介又要求交“转名费/征信修复费/延期费”，你会？',
    options: [
      { label: 'A', text: '继续交钱争取解决', score: 3 },
      { label: 'B', text: '少交一部分试试', score: 2 },
      { label: 'C', text: '拒绝二次收费，收集证据并举报', score: 0 },
    ],
  },
  {
    id: 13,
    stage: '第七步：止损取证',
    stageDesc: '越早固定证据，越有利于后续维权和打击非法中介。',
    title: '发现自己或亲友已经卷入疑似AB贷，最优先做什么？',
    options: [
      { label: 'A', text: '先删除聊天，避免被家人知道', score: 3 },
      { label: 'B', text: '只在微信群里曝光对方', score: 2 },
      { label: 'C', text: '保存合同、聊天、转账、门店地址、人员照片和录音，联系放款机构并报警/举报', score: 0 },
    ],
  },
]

const answers = reactive<Record<number, string>>({})
const result = ref<null | {
  level: string
  title: string
  diagnosis: string
  alertType: 'success' | 'warning' | 'error'
  suggestions: string[]
}>(null)
const totalScore = ref(0)

const groupedQuestions = computed<QuizGroup[]>(() => {
  return questions.reduce((groups, question) => {
    let group = groups.find(item => item.stage === question.stage)
    if (!group) {
      group = {
        stage: question.stage,
        desc: question.stageDesc,
        items: [],
      }
      groups.push(group)
    }
    group.items.push(question)
    return groups
  }, [] as QuizGroup[])
})

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

  if (score >= 26) {
    result.value = {
      level: '高风险',
      title: '你已经高度接近AB贷完整执行链路，请立即停止配合。',
      diagnosis: '你的选择覆盖了获客、找B、包装资质、签约、转账或二次收费等关键环节，继续推进可能导致本人或亲友成为法律借款人并承担征信风险。',
      alertType: 'error',
      suggestions: [
        '不要再签署、刷脸、转账、过账或提供验证码、银行卡、身份证照片。',
        '马上核对贷款合同、APP页面和短信，确认借款人、金额、收款账户和还款责任。',
        '保存中介门店、人员姓名、聊天记录、合同、转账凭证，尽快联系放款机构、警方或平台举报。',
      ],
    }
    return
  }

  if (score >= 13) {
    result.value = {
      level: '中风险',
      title: '你已接触到多个AB贷关键话术，继续办理风险很高。',
      diagnosis: '你可能处在“找B、包装资质或签约面审”阶段。此时最重要的是暂停流程，不要让口头承诺替代合同责任。',
      alertType: 'warning',
      suggestions: [
        '凡是让你替他人贷款、当“监管人/紧急联系人”、过账或后续转名的，都应先暂停。',
        '不要相信“B不用还、不影响征信、几个月后转名”的口头承诺。',
        '通过银行、消费金融公司官方客服核实，不要只听中介或熟人解释。',
      ],
    }
    return
  }

  result.value = {
    level: '低风险',
    title: '你的AB贷识别意识较好，请继续保持谨慎。',
    diagnosis: '你能识别“替人贷款、名义借款、资金转出、高额服务费”等核心风险点。',
    alertType: 'success',
    suggestions: [
      '坚持只为本人真实用款申请贷款，不替他人做名义借款人。',
      '提醒亲友警惕“担保人、监管人、紧急联系人、贷款转名”等话术。',
      '遇到可疑中介时，优先保存证据并走官方渠道核验。',
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

function goCases() {
  router.push('/cases')
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
  line-height: 1.7;
}

.progress-text {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.question-card {
  margin-bottom: 14px;
}

.stage-block + .stage-block {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #ebeef5;
}

.stage-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  color: #606266;
  line-height: 1.6;
}

.question-item + .question-item {
  margin-top: 16px;
}

.question-title {
  margin-bottom: 10px;
  font-weight: 600;
  line-height: 1.6;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  height: auto;
  margin-right: 0;
  padding: 10px 14px;
  white-space: normal;
}

.result-desc {
  margin: 14px 0;
}

.suggest-list {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 6px;
    line-height: 1.6;
  }
}

@media (max-width: 992px) {
  .quiz-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .stage-head {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
  }
}
</style>
