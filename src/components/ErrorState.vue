<template>
  <el-result icon="error" :title="title" :sub-title="description" class="error-state">
    <template #extra>
      <el-space>
        <el-button type="primary" @click="emit('retry')">{{ retryText }}</el-button>
        <el-button v-if="secondaryText" @click="emit('secondary')">{{ secondaryText }}</el-button>
      </el-space>
    </template>
  </el-result>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description: string
  retryText?: string
  secondaryText?: string
}>()

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'secondary'): void
}>()
</script>

<style scoped>
.error-state {
  padding: 16px 0;
}
</style>
