<template>
  <el-header height="60px" class="header-nav">
    <div class="logo">AB贷风险地图</div>
    <el-menu mode="horizontal" :default-active="activeIndex" class="nav-menu" @select="handleSelect">
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="quiz">AB贷自测</el-menu-item>
      <el-menu-item index="cases">公开案例</el-menu-item>
      <el-menu-item index="report">举报入口</el-menu-item>
      <el-menu-item index="search">
        <el-icon><Search /></el-icon>
        搜索
      </el-menu-item>
      <el-menu-item index="feedback">反馈</el-menu-item>
      <el-menu-item index="help">帮助中心</el-menu-item>
      <el-menu-item index="policy">隐私声明</el-menu-item>
      <el-menu-item index="stats">数据统计</el-menu-item>
      <el-menu-item index="about">关于AB贷</el-menu-item>
      <el-menu-item index="profile">
        <el-icon><User /></el-icon>
        个人中心
      </el-menu-item>
    </el-menu>
    <el-tooltip content="管理员登录" placement="bottom">
      <button class="admin-avatar-btn" type="button" @click="openAdminLogin">
        <el-avatar :size="36">
          <el-icon><User /></el-icon>
        </el-avatar>
      </button>
    </el-tooltip>

    <el-dialog v-model="adminDialogVisible" title="管理员登录" width="420px" class="admin-login-dialog">
      <el-form label-width="72px" @submit.prevent>
        <el-form-item label="账号">
          <el-input v-model="adminForm.username" placeholder="管理员账号" clearable />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="adminForm.password"
            type="password"
            show-password
            placeholder="管理员密码"
            clearable
            @keyup.enter="loginAdmin"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="adminDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="adminLoggingIn" @click="loginAdmin">登录并进入审核</el-button>
      </template>
    </el-dialog>
  </el-header>
</template>

<script setup lang="ts">
import { Search, User } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { getAdminAccount, getAdminReports, saveAdminAccount } from '@/services/adminReportService'

const router = useRouter()
const route = useRoute()
const storedAdminAccount = getAdminAccount()
const adminDialogVisible = ref(false)
const adminLoggingIn = ref(false)
const adminForm = reactive({
  username: storedAdminAccount.username || 'abRoleAdmin',
  password: storedAdminAccount.password || '',
})

const activeIndex = computed(() => {
  const path = route.path.replace(/^\//, '')
  const firstSegment = path.split('/')[0]
  return firstSegment || 'home'
})

function handleSelect(key: string) {
  router.push(`/${key}`)
}

function openAdminLogin() {
  adminDialogVisible.value = true
}

async function loginAdmin() {
  const account = {
    username: adminForm.username.trim(),
    password: adminForm.password,
  }

  if (!account.username || !account.password) {
    ElMessage.warning('请输入管理员账号和密码')
    return
  }

  adminLoggingIn.value = true
  try {
    await getAdminReports({ account })
    saveAdminAccount(account)
    adminDialogVisible.value = false
    ElMessage.success('管理员登录成功')
    router.push('/admin/reports')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '管理员登录失败')
  } finally {
    adminLoggingIn.value = false
  }
}
</script>

<style lang="scss" scoped>
.header-nav {
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  position: relative;
  margin-bottom: 20px;
  justify-content: flex-start;
  background-color: #fff;
  padding: 0 20px;
  border-bottom: 1px solid #eaeaea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  gap: 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
  white-space: nowrap;
}

.nav-menu {
  flex: 1;
  min-width: 0;
  justify-content: flex-end;
  background: transparent;
  border: none;

  :deep(.el-menu-item) {
    display: flex;
    align-items: center;
    gap: 6px;

    .el-icon {
      font-size: 16px;
    }
  }
}

.admin-avatar-btn {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.admin-avatar-btn :deep(.el-avatar) {
  background: #303133;
  transition: transform .2s ease, box-shadow .2s ease;
}

.admin-avatar-btn:hover :deep(.el-avatar) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.16);
}

@media (max-width: 768px) {
  .header-nav {
    height: auto !important;
    min-height: 60px;
    padding: 8px 12px 0;
    gap: 8px;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 12px;
  }

  .logo {
    font-size: 16px;
    line-height: 1.4;
    padding-right: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-menu {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    justify-content: flex-start;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    :deep(.el-menu) {
      flex-wrap: nowrap;
    }

    :deep(.el-menu-item) {
      height: 44px;
      font-size: 14px;
      padding: 0 10px !important;
      flex-shrink: 0;
    }
  }

  .admin-avatar-btn {
    position: absolute;
    top: 8px;
    right: 12px;
  }

  .admin-login-dialog :deep(.el-dialog) {
    width: calc(100vw - 24px) !important;
  }
}
</style>
