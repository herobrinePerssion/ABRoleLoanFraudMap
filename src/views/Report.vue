<template>
  <el-main class="report-page">
    <el-page-header content="举报入口" />

    <el-row :gutter="20" class="report-layout">
      <el-col :xs="24" :md="16">
        <el-card shadow="hover">
          <template #header>
            <div class="card-title">非法中介举报信息</div>
          </template>
          <ReportForm @submitted="handleSubmitted" />
        </el-card>
      </el-col>

      <el-col :xs="24" :md="8">
        <el-card shadow="never" class="tips-card">
          <template #header>
            <div class="card-title">提交前准备</div>
          </template>
          <ul>
            <li>公司名称、所在城市、详细地址、楼层门牌号</li>
            <li>公司门头、办公现场、合同、收据、聊天记录截图</li>
            <li>法人、负责人、业务员姓名与联系方式</li>
            <li>收款账户、二维码、网站链接、社交账号等线索</li>
          </ul>
          <el-divider />
          <el-alert
            type="info"
            :closable="false"
            show-icon
            title="请勿提交银行卡密码、支付密码、短信验证码等高敏信息。"
          />
        </el-card>

        <el-card shadow="never" class="lookup-card">
          <template #header>
            <div class="card-title">举报进度查询</div>
          </template>
          <el-input v-model="lookupId" placeholder="请输入编号，如 AB-20260416-1234" clearable />
          <el-button type="primary" class="lookup-btn" @click="goLookup">查询进度</el-button>
          <el-button class="lookup-btn" @click="goHelp">查看帮助中心</el-button>
          <el-button class="lookup-btn" @click="goPolicy">隐私与法律说明</el-button>
        </el-card>
      </el-col>
    </el-row>
  </el-main>
</template>

<script setup lang="ts">
import ReportForm from '@/components/reportForm.vue'
import { normalizeReportId } from '@/services/reportService'

const router = useRouter()
const lookupId = ref('')

function handleSubmitted(payload: { id: string }) {
  router.push({ path: '/report/success', query: { id: payload.id } })
}

function goLookup() {
  const id = normalizeReportId(lookupId.value)
  if (!id) {
    ElMessage.warning('请输入举报编号')
    return
  }
  router.push({ path: '/report/success', query: { id } })
}

function goHelp() {
  router.push('/help')
}

function goPolicy() {
  router.push('/policy')
}
</script>

<style lang="scss" scoped>
.report-page {
  padding: 0 20px 20px;
}

.report-layout {
  margin-top: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
}

.tips-card ul {
  margin: 0;
  padding-left: 18px;

  li {
    margin-bottom: 8px;
    color: #606266;
    line-height: 1.6;
  }
}

.lookup-card {
  margin-top: 14px;

  .lookup-btn {
    margin-top: 10px;
    width: 100%;
  }
}

@media (max-width: 992px) {
  .report-page {
    padding: 0 12px 16px;
  }
}

@media (max-width: 768px) {
  .report-layout {
    :deep(.el-col) {
      margin-bottom: 14px;
    }
  }

  :deep(.el-card__header),
  :deep(.el-card__body) {
    padding: 14px;
  }

  .lookup-card {
    margin-top: 0;

    .lookup-btn {
      margin-left: 0;
    }
  }
}
</style>
