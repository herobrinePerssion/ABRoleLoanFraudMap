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
            <div class="card-title">AB贷常见问题与处置建议</div>
          </template>
          <p class="hero-desc">
            这里汇总 AB贷定义、典型话术、风险识别、证据整理、举报提交和止损处置建议。AB贷的关键风险在于：实际用款人A拿钱，名义借款人B可能承担合同还款和征信后果。
          </p>
          <el-space wrap>
            <el-button type="primary" @click="goReport">我要举报</el-button>
            <el-button @click="goQuiz">AB贷自测</el-button>
            <el-button @click="goCases">查看案例</el-button>
          </el-space>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="contact-card">
          <template #header>
            <div class="card-title">紧急建议</div>
          </template>
          <ul class="simple-list">
            <li>不要继续签字、刷脸、转账或过账。</li>
            <li>不要提供验证码、银行卡密码、支付密码或远程控制权限。</li>
            <li>立即保存合同、聊天、转账、门店地址和人员信息。</li>
            <li>优先联系放款机构、警方或官方反诈渠道核实处理。</li>
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
              <div class="quick-desc">提交非法中介门店、人员、地址和证据材料</div>
            </div>
            <div class="quick-item" @click="goCases">
              <div class="quick-title">公开案例</div>
              <div class="quick-desc">查看监管提示、司法案例和公开报道整理</div>
            </div>
            <div class="quick-item" @click="goQuiz">
              <div class="quick-title">AB贷自测</div>
              <div class="quick-desc">按21题链路判断自己处在哪个风险阶段</div>
            </div>
            <div class="quick-item" @click="goPolicy">
              <div class="quick-title">隐私与法律说明</div>
              <div class="quick-desc">了解信息采集范围、使用方式与免责声明</div>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="side-card">
          <template #header>
            <div class="card-title">处理顺序</div>
          </template>
          <el-steps direction="vertical" :active="4" finish-status="success">
            <el-step title="先停止签字、刷脸和转账" />
            <el-step title="整理合同、聊天、转账和门店证据" />
            <el-step title="联系放款机构并报警或举报" />
            <el-step title="使用编号查询处理进度" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
const router = useRouter()
const activeNames = ref(['definition', 'signals', 'report'])

const faqList = [
  {
    name: 'definition',
    category: '基础定义',
    title: 'AB贷到底是什么？',
    answer: 'AB贷通常指实际用款人A因资质不足、征信较差或负债较高，无法直接获得贷款，于是通过中介诱导征信较好的B以本人名义申请贷款。资金由A使用，但合同上的借款人、还款责任和征信风险可能落在B身上。',
    points: [
      'A是实际用款人，B是名义申请人或实际合同借款人。',
      'B常被包装成“担保人、监管人、紧急联系人、共管人”。',
      '只要合同借款人是B，口头承诺通常不能免除B的还款责任。',
    ],
  },
  {
    name: 'signals',
    category: '识别风险',
    title: '哪些话术最像AB贷套路？',
    answer: '如果对方强调“你只是帮忙”“不影响征信”“几个月后转到A名下”“钱到账后转给A或中介代管”，就要高度警惕。这些话术的共同点是弱化B的法律责任，推动B完成贷款流程。',
    points: [
      '“你只是担保人/监管人/紧急联系人，不用还款”。',
      '“6个月后转名，B不会承担责任”。',
      '“贷款到账先转给A或中介过账、代管”。',
      '“服务费从贷款里扣，帮你包装资质”。',
    ],
  },
  {
    name: 'difference',
    category: '责任边界',
    title: '担保人、紧急联系人和借款人有什么区别？',
    answer: '借款人是贷款合同中的还款责任主体；担保人可能在约定范围内承担担保责任；紧急联系人通常只是联系信息。AB贷的风险在于，中介口头说你是担保人或联系人，但实际合同、APP或面签页面可能写的是你本人借款。',
    points: [
      '看合同和APP页面，不只听口头解释。',
      '确认借款人、共同借款人、担保人、收款账户和还款账户。',
      '页面显示本人为借款人时，应立即停止替他人办理。',
    ],
  },
  {
    name: 'before-sign',
    category: '办理前',
    title: '还没签字或刷脸，但已经被拉去门店，怎么办？',
    answer: '最优先的是暂停流程，不要交出身份证、银行卡、验证码、人脸识别或手机控制权。带走或拍下可公开保存的材料，核验中介公司名称、地址、人员身份和是否具备合法资质。',
    points: [
      '不要在催促下签署任何贷款、授权或服务协议。',
      '不要开启屏幕共享、远程控制或代办登录。',
      '保留门店地址、门头照片、业务员姓名和联系方式。',
    ],
  },
  {
    name: 'after-loan',
    category: '放款后',
    title: '贷款已经到我账户，对方要求转给A或中介，怎么办？',
    answer: '不要继续转账。贷款进入你的账户并不代表你可以安全转出，反而可能说明你已经成为贷款流程中的名义或实际借款人。应立即联系放款机构说明资金用途异常，并保存对方要求转账的证据。',
    points: [
      '不要向个人账户、不明二维码或拆分账户转账。',
      '保存对方要求“过账、代管、刷流水”的聊天记录。',
      '联系放款机构核实合同责任和资金用途要求。',
    ],
  },
  {
    name: 'fee',
    category: '收费陷阱',
    title: '中介收服务费、包装费、渠道费是否正常？',
    answer: 'AB贷黑中介常在放款后抽取高额服务费，有的还会通过个人账户收款，并要求备注咨询费或服务费。凡是高比例收费、收款主体不一致、无正规合同票据的，都应视为高风险。',
    points: [
      '核验收款主体是否与合同主体一致。',
      '拒绝向个人账户支付高额服务费。',
      '保存收费标准、转账凭证、收款账户和聊天记录。',
    ],
  },
  {
    name: 'evidence',
    category: '证据整理',
    title: '举报AB贷黑中介，需要准备哪些材料？',
    answer: '建议围绕“人、店、合同、资金流、话术”整理证据。材料越完整，越有利于后续核验、举报和维权。',
    points: [
      '公司名称、门店地址、门头照片、办公现场照片。',
      '业务员、负责人、法人姓名、电话、微信、收款账户。',
      '贷款合同、服务协议、授权书、APP页面截图。',
      '聊天记录、通话录音、转账凭证、二维码和银行卡账户。',
    ],
  },
  {
    name: 'report',
    category: '举报流程',
    title: '如何在本平台提交举报？',
    answer: '进入举报入口后，尽量填写公司名称、所在省市、详细地址、楼层门牌号、公司照片、法人或负责人信息、联系电话和线索描述。你也可以使用地图标点记录门店位置。',
    points: [
      '手动输入地址或在地图上标点都可以。',
      '公司照片可上传门头、办公环境、合同、收款码等图片。',
      '提交后保存编号，用于后续查询进度。',
    ],
  },
  {
    name: 'privacy',
    category: '隐私安全',
    title: '提交举报时，哪些信息不要上传？',
    answer: '不要上传银行卡密码、支付密码、短信验证码、完整银行卡敏感验证信息等高敏内容。举报重点应放在中介主体、行为过程、合同和资金流证据上。',
    points: [
      '不要提交短信验证码、支付密码、银行卡密码。',
      '身份证、银行卡照片如非必要，应遮挡部分敏感号码。',
      '描述事实时保留时间、地点、人物、账户和行为过程。',
    ],
  },
  {
    name: 'already-in',
    category: '止损处置',
    title: '已经卷入AB贷，第一步应该做什么？',
    answer: '先停止继续签字、刷脸、转账、过账和支付服务费。随后固定证据，联系放款机构确认合同责任和还款状态，必要时报警或向监管、平台举报。',
    points: [
      '不要删除聊天记录，不要只依赖口头沟通。',
      '整理时间线：谁介绍、在哪办理、签了什么、钱流向哪里。',
      '如果已经逾期，应主动联系放款机构说明情况并保留沟通记录。',
    ],
  },
  {
    name: 'query',
    category: '进度查询',
    title: '举报提交后如何查询处理进度？',
    answer: '提交成功后系统会生成唯一编号。你可以在举报成功页或举报页右侧查询入口输入编号，查看当前状态和时间线。',
    points: [
      '请妥善保存举报编号。',
      '查询不到时，先检查编号是否完整输入。',
      '如果补充了新证据，可再次提交并在描述中关联原编号。',
    ],
  },
]

function goReport() {
  router.push('/report')
}

function goQuiz() {
  router.push('/quiz')
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

  span {
    min-width: 0;
    overflow-wrap: anywhere;
  }
}

.faq-answer {
  color: #606266;
  line-height: 1.7;

  p {
    margin: 0 0 10px;
  }
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
  line-height: 1.6;
}

.side-card + .side-card {
  margin-top: 16px;
}

@media (max-width: 992px) {
  .help-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .faq-title {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    padding: 8px 8px 8px 0;
    line-height: 1.5;
  }

  :deep(.el-collapse-item__header) {
    height: auto;
    min-height: 48px;
  }
}
</style>
