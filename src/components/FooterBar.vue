<template>
  <el-footer class="footer-bar" height="auto">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="brand-title">AB 贷诈骗识别与防护平台</div>
        <div class="brand-desc">
          面向公众提供风险识别、案例科普、线索举报与进度查询服务。页面内容主要用于反诈教育与风险提醒。
        </div>
      </div>

      <div class="footer-links">
        <div class="link-group">
          <div class="group-title">快捷入口</div>
          <el-link @click="go('/home')">首页</el-link>
          <el-link @click="go('/quiz')">防骗自测</el-link>
          <el-link @click="go('/cases')">案例列表</el-link>
          <el-link @click="go('/report')">举报入口</el-link>
        </div>

        <div class="link-group">
          <div class="group-title">支持与说明</div>
          <el-link @click="go('/help')">帮助中心</el-link>
          <el-link @click="go('/policy')">隐私声明</el-link>
          <el-link @click="go('/about')">关于 AB 贷</el-link>
          <el-link @click="go('/stats')">数据统计</el-link>
        </div>

        <div class="link-group">
          <div class="group-title">免责声明</div>
          <div class="group-text">案例与数据主要用于反诈科普，不构成法律意见、金融建议或案件结论。</div>
          <div class="group-text">请勿提交银行卡密码、支付密码、短信验证码等高敏信息。</div>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 AB 贷反诈项目</span>
      <span>建议在紧急情况下优先联系警方或官方反诈渠道</span>
    </div>
  </el-footer>
</template>

<script setup lang="ts">
const router = useRouter()

function go(path: string) {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.footer-bar {
  margin-top: 24px;
  padding: 0;
  background: #0f172a;
  color: #cbd5e1;
}

.footer-inner {
  display: grid;
  grid-template-columns: 1.3fr 2fr;
  gap: 32px;
  padding: 28px 20px 20px;
}

.footer-brand {
  .brand-title {
    font-size: 18px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 10px;
  }

  .brand-desc {
    line-height: 1.8;
    color: #cbd5e1;
  }
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.link-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .group-title {
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 2px;
  }

  .group-text {
    line-height: 1.7;
    color: #cbd5e1;
    font-size: 13px;
  }

  :deep(.el-link) {
    justify-content: flex-start;
    color: #cbd5e1;
  }

  :deep(.el-link:hover) {
    color: #60a5fa;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 14px 20px 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 12px;
  color: #94a3b8;
}

@media (max-width: 992px) {
  .footer-inner {
    grid-template-columns: 1fr;
    padding: 24px 12px 18px;
  }

  .footer-links {
    grid-template-columns: 1fr;
  }

  .footer-bottom {
    padding: 12px;
    flex-direction: column;
  }
}
</style>
