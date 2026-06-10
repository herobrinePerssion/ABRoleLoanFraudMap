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
}
</style>
