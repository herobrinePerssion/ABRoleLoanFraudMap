<template>
  <el-main class="help-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>帮助中心</el-breadcrumb-item>
    </el-breadcrumb>

    <el-page-header content="帮助中心 / FAQ" />

    <el-row :gutter="16" class="hero-row">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" class="hero-card">
          <template #header>
            <div class="card-title">常见问题与处理建议</div>
          </template>
          <p class="hero-desc">
            这里汇总了 AB 贷项目中用户最常遇到的问题，包括如何识别骗局、如何提交线索、如何查询进度，以及发现可疑情况后的第一时间处置建议。
          </p>
          <el-space wrap>
            <el-button type="primary" @click="goReport">我要举报</el-button>
            <el-button @click="goQuiz">防骗自测</el-button>
            <el-button @click="goAbout">了解 AB 贷</el-button>
          </el-space>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="contact-card">
          <template #header>
            <div class="card-title">紧急建议</div>
          </template>
          <ul class="simple-list">
            <li>不要继续向陌生账户转账</li>
            <li>不要提供验证码、密码、远程控制权限</li>
            <li>立即保留聊天、转账、通话记录</li>
            <li>优先通过官方渠道核验对方身份</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <el-card shadow="never">
          <template #header>
            <div class="card-title">FAQ 列表</div>
          </template>

          <el-collapse v-model="activeNames">
            <el-collapse-item v-for="item in faqList" :key="item.name" :name="item.name">
              <template #title>
                <div class="faq-title">
                  <span>{{ item.title }}</span>
                  <el-tag size="small" effect="plain">{{ item.category }}</el-tag>
                </div>
              </template>
              <div class="faq-answer">
                <p>{{ item.answer }}</p>
                <ul v-if="item.points?.length" class="simple-list">
                  <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
                </ul>
              </div>
            </el-collapse-item>
          </el-collapse>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="side-card">
          <template #header>
            <div class="card-title">快捷入口</div>
          </template>
          <div class="quick-links">
            <div class="quick-item" @click="goReport">
              <div class="quick-title">举报入口</div>
              <div class="quick-desc">提交被骗线索并生成查询编号</div>
            </div>
            <div class="quick-item" @click="goCases">
              <div class="quick-title">案例列表</div>
              <div class="quick-desc">查看真实套路与预警信号</div>
            </div>
            <div class="quick-item" @click="goQuiz">
              <div class="quick-title">防骗自测</div>
              <div class="quick-desc">快速评估自身风险暴露程度</div>
            </div>
            <div class="quick-item" @click="goPolicy">
              <div class="quick-title">隐私与法律声明</div>
              <div class="quick-desc">了解信息采集范围、使用方式与免责声明</div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="side-card">
          <template #header>
            <div class="card-title">使用说明</div>
          </template>
          <el-steps direction="vertical" :active="4" finish-status="success">
            <el-step title="先阅读风险提示" />
            <el-step title="必要时完成防骗自测" />
            <el-step title="整理证据后提交举报" />
            <el-step title="使用编号查询处理进度" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
const router = useRouter()
const activeNames = ref(['recognize', 'report'])

const faqList = [
  {
    name: 'recognize',
    category: '识别风险',
    title: '什么样的贷款流程可以高度怀疑是 AB 贷诈骗？',
    answer: '凡是出现“放款前收费”“保证金/解冻金/刷流水”“冒充银行或军官身份背书”等情况，都应高度警惕。正规金融机构不会要求你向私人账户转账来完成放款。',
    points: [
      '先收费再放款，是最核心的风险特征',
      '催促你立即操作，通常是为了压缩你的判断时间',
      '要求验证码、屏幕共享、远程控制，属于高危信号',
    ],
  },
  {
    name: 'report',
    category: '举报流程',
    title: '提交举报时需要准备哪些材料？',
    answer: '建议至少准备聊天记录、转账记录、收款账户信息、合同/页面截图四类材料。材料越完整，越有利于后续核验与归档。',
    points: [
      '聊天记录要尽量保留原始时间信息',
      '转账凭证请包含金额、账户、时间',
      '不要上传密码、验证码等超敏信息',
    ],
  },
  {
    name: 'query',
    category: '进度查询',
    title: '举报提交后如何查询处理进度？',
    answer: '提交成功后系统会生成唯一编号。你可以在举报成功页或举报页右侧的查询入口输入编号，查看当前状态和时间线。',
    points: [
      '请妥善保存编号',
      '若查询不到，先检查编号是否完整输入',
      '若仍无结果，可重新核对是否提交成功',
    ],
  },
  {
    name: 'evidence',
    category: '证据处理',
    title: '我已经意识到可能被骗，现在第一步该做什么？',
    answer: '先停止继续转账和配合操作，立即保存已有证据，并尽快联系警方或相关平台处理。不要再与对方进行高风险互动。',
    points: [
      '立即终止转账',
      '截图保存聊天、订单、链接、二维码',
      '必要时修改关联账户密码并检查设备安全',
    ],
  },
  {
    name: 'privacy',
    category: '隐私与安全',
    title: '举报时会不会泄露我的隐私？',
    answer: '项目应坚持最小化采集原则，只保留处理线索所必需的信息。你在提交时也应避免填写与案件无关的过度敏感内容。',
    points: [
      '不要提交银行卡密码、支付密码',
      '不要上传短信验证码',
      '描述重点放在案件事实、时间、账户与行为过程',
    ],
  },
  {
    name: 'validity',
    category: '线索质量',
    title: '什么样的举报才算有效线索？',
    answer: '有效线索通常至少包含主体信息、行为过程描述、可验证证据中的两类以上。若只有模糊描述且无任何证据，后续处理难度会显著提升。',
    points: [
      '主体信息：名称、账号、电话、网址等',
      '行为过程：何时接触、如何诱导、资金如何流转',
      '证据材料：截图、录音、转账凭证、合同等',
    ],
  },
]

function goReport() {
  router.push('/report')
}

function goQuiz() {
  router.push('/quiz')
}

function goAbout() {
  router.push('/about')
}

function goCases() {
  router.push('/cases')
}

function goPolicy() {
  router.push('/policy')
}
</script>

<style lang="scss" scoped>
.help-page {
  padding: 0 20px 20px;
}

.breadcrumb {
  margin-bottom: 12px;
}

.hero-row {
  margin: 12px 0 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.hero-card,
.contact-card,
.side-card {
  height: 100%;
}

.hero-desc {
  margin: 0 0 14px;
  color: #606266;
  line-height: 1.7;
}

.simple-list {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 8px;
    color: #606266;
    line-height: 1.6;
  }
}

.faq-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding-right: 10px;
}

.faq-answer {
  color: #606266;
  line-height: 1.7;
}

.quick-links {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-item {
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #409eff;
    background: #f5f9ff;
  }
}

.quick-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 6px;
}

.quick-desc {
  color: #909399;
  font-size: 13px;
}

.side-card + .side-card {
  margin-top: 16px;
}

@media (max-width: 992px) {
  .help-page {
    padding: 0 12px 16px;
  }
}
</style>
