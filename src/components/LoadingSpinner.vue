<template>
  <div class="loading-spinner">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: '加载中...',
  },
});
</script>

<style scoped lang="scss">
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  .spinner-container {
    text-align: center;

    .spinner {
      width: 48px;
      height: 48px;
      margin: 0 auto 16px;
      border: 4px solid #f0f0f0;
      border-top-color: #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-message {
      margin: 0;
      font-size: 14px;
      color: #666;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .loading-spinner {
    padding: 30px 15px;

    .spinner-container {
      .spinner {
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>
