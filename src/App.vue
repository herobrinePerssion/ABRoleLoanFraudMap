<!--
 * @Author: arron Zhu
 * @Date: 2025-07-26 23:35:55
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-26 23:58:14
 * @Description:
-->
<template>
  <el-container class="el-container">
    <Header />
    <div class="page-content">
      <router-view />
    </div>
    <FooterBar />
  </el-container>
</template>

<script setup lang="ts">
</script>
<style lang="scss" scoped>
.el-container {
  min-height: 100vh;
  flex-direction: column;
}

.page-content {
  flex: 1;
}
</style>
