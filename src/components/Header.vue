<template>
  <el-header height="60px" class="header-nav">
    <div class="logo">AB贷全国诈骗地图</div>
    <el-menu mode="horizontal" :default-active="activeIndex" class="nav-menu" @select="handleSelect">
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="quiz">防骗自测</el-menu-item>
      <el-menu-item index="cases">案例列表</el-menu-item>
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
  </el-header>
</template>

<script setup lang="ts">
import { Search, User } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()
const route = useRoute()

const activeIndex = computed(() => {
  const path = route.path.replace(/^\//, '')
  const firstSegment = path.split('/')[0]
  return firstSegment || 'home'
})

function handleSelect(key: string) {
  router.push(`/${key}`)
}
</script>

<style lang="scss" scoped>
.header-nav {
 width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
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

@media (max-width: 768px) {
  .header-nav {
    padding: 0 15px;
    gap: 15px;
  }

  .logo {
    font-size: 16px;
  }

  .nav-menu {
    :deep(.el-menu-item) {
      font-size: 14px;
      padding: 0 10px !important;
    }
  }
}
</style>
