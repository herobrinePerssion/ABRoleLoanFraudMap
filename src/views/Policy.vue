<template>
  <el-main class="policy-page">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item to="/home">首页</el-breadcrumb-item>
      <el-breadcrumb-item>隐私政策与法律声明</el-breadcrumb-item>
    </el-breadcrumb>

    <el-page-header content="隐私政策与法律声明" />

    <el-alert
      class="hero-alert"
      type="info"
      show-icon
      :closable="false"
      title="本页面用于说明 AB 贷反诈项目的信息采集范围、使用方式、用户权利与免责声明。"
    />

    <el-row :gutter="16">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover" class="section-card">
          <template #header><div class="card-title">一、信息采集范围</div></template>
          <p>
            本项目遵循“最小必要”原则，仅收集为线索登记、风险展示与用户查询所必须的信息。正常访问科普页面时，不要求用户提供身份认证类信息。
          </p>
          <ul class="policy-list">
            <li>举报信息：线索主体、地区、描述、相关证据说明</li>
            <li>系统信息：页面访问、基础交互行为，用于体验优化与统计分析</li>
            <li>查询信息：用户主动输入的举报编号，用于查询处理进度</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header><div class="card-title">二、信息使用目的</div></template>
          <ul class="policy-list">
            <li>用于记录用户提交的反诈线索，形成可追踪的编号与处理状态</li>
            <li>用于统计分析诈骗类型、地区风险与高频话术，提升公众识别能力</li>
            <li>用于优化页面交互体验、改进帮助中心与风险提示内容</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header><div class="card-title">三、敏感信息与禁止提交内容</div></template>
          <el-alert
            type="warning"
            show-icon
            :closable="false"
            title="请勿提交银行卡密码、支付密码、短信验证码、人脸识别动态口令等超敏信息。"
          />
          <ul class="policy-list mt-12">
            <li>不要上传与案件无关的身份证全量照片或家庭隐私材料</li>
            <li>描述重点应放在诈骗过程、收款账户、联系方式、时间节点等事实信息</li>
            <li>如需留存证据，优先保留截图、链接、通话记录、转账凭证</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header><div class="card-title">四、信息保存与展示原则</div></template>
          <p>
            当前演示版本中的部分数据可能以本地存储方式保存，仅用于原型验证。后续若接入服务端，应明确设置保存周期、脱敏展示规则与访问控制机制。
          </p>
          <ul class="policy-list">
            <li>展示案例时应优先使用脱敏后的公开信息</li>
            <li>线索状态展示应避免泄露与案件无关的个人隐私</li>
            <li>运营数据应区分公开展示数据与内部处理数据</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header><div class="card-title">五、用户权利说明</div></template>
          <ul class="policy-list">
            <li>用户有权了解其提交信息的用途与展示范围</li>
            <li>用户有权要求更正明显错误的信息描述</li>
            <li>如因误提交、误关联等情况造成影响，用户可申请复核或删除</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="section-card">
          <template #header><div class="card-title">六、法律声明</div></template>
          <ul class="policy-list">
            <li>本项目页面内容主要用于反诈教育、风险提示与线索归集，不构成法律意见、金融建议或案件结论</li>
            <li>页面中的案例、数据与标签为科普展示用途，用户应结合官方通报与司法结果进行判断</li>
            <li>任何人不得利用本项目实施恶意举报、诽谤、隐私泄露或其他违法行为</li>
          </ul>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="side-card">
          <template #header><div class="card-title">合规提醒</div></template>
          <ul class="policy-list compact">
            <li>坚持最小化采集</li>
            <li>坚持敏感信息脱敏</li>
            <li>坚持用户知情与可追溯</li>
            <li>坚持内容来源标注与更新时间说明</li>
          </ul>
        </el-card>

        <el-card shadow="never" class="side-card">
          <template #header><div class="card-title">快捷入口</div></template>
          <el-space direction="vertical" fill>
            <el-button type="primary" @click="goReport">前往举报入口</el-button>
            <el-button @click="goHelp">查看帮助中心</el-button>
            <el-button @click="goCases">浏览案例列表</el-button>
          </el-space>
        </el-card>

        <el-card shadow="never" class="side-card">
          <template #header><div class="card-title">版本说明</div></template>
          <p class="version-text">
            当前为项目原型阶段文档页，后续若接入正式服务端、用户系统或上传能力，应同步更新本页内容。
          </p>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
const router = useRouter()

function goReport() {
  router.push('/report')
}

function goHelp() {
  router.push('/help')
}

function goCases() {
  router.push('/cases')
}
</script>

<style lang="scss" scoped>
.policy-page {
  padding: 0 20px 20px;
}

.breadcrumb {
  margin-bottom: 12px;
}

.hero-alert {
  margin: 12px 0 16px;
}

.section-card,
.side-card {
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.policy-list {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 8px;
    color: #606266;
    line-height: 1.7;
  }

  &.compact li {
    margin-bottom: 6px;
  }
}

.mt-12 {
  margin-top: 12px;
}

.version-text,
p {
  color: #606266;
  line-height: 1.8;
}

@media (max-width: 992px) {
  .policy-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .policy-page {
    :deep(.el-card__header),
    :deep(.el-card__body) {
      padding: 14px;
    }

    .policy-list {
      padding-left: 18px;
    }

    :deep(.el-space),
    :deep(.el-space__item),
    :deep(.el-button) {
      width: 100%;
    }

    p,
    li {
      overflow-wrap: anywhere;
    }
  }
}
</style>
