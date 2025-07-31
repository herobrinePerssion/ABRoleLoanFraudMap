<template>
  <el-header height="60px" class="header-nav">
    <div class="logo">AB贷全国诈骗地图</div>
    <el-menu mode="horizontal" :default-active="activeIndex" class="nav-menu" @select="handleSelect">
      <el-menu-item index="home">首页</el-menu-item>
      <el-menu-item index="report">举报入口</el-menu-item>
      <el-menu-item index="stats">数据统计</el-menu-item>
      <el-menu-item index="about">关于AB贷</el-menu-item>
    </el-menu>
  </el-header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'

const activeIndex = ref('home')
const router = useRouter()

function handleSelect(key: string) {
  activeIndex.value = key
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
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: #409EFF;
}

.nav-menu {
  flex: 1;
  justify-content: flex-end;
  background: transparent;
  border: none;
}
</style>
