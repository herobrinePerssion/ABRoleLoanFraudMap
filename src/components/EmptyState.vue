<template>
  <el-empty :description="description" class="empty-state">
    <template #image>
      <el-icon :size="72" color="#c0c4cc">
        <Search />
      </el-icon>
    </template>
    <template #default>
      <div class="title">{{ title }}</div>
      <div class="desc">{{ description }}</div>
      <el-button v-if="actionText" type="primary" plain class="action-btn" @click="emit('action')">
        {{ actionText }}
      </el-button>
    </template>
  </el-empty>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description: string
  actionText?: string
}>()

const emit = defineEmits<{
  (e: 'action'): void
}>()
</script>

<style scoped>
.empty-state {
  padding: 24px 0;
}

.title {
  margin-top: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.desc {
  margin-top: 4px;
  color: #909399;
}

.action-btn {
  margin-top: 12px;
}
</style>
