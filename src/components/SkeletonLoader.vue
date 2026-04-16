<template>
  <div :class="skeletonClasses">
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text short"></div>
      </div>
    </div>

    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in rows" :key="i" class="skeleton-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content-list">
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    </div>

    <div v-else-if="type === 'form'" class="skeleton-form">
      <div v-for="i in 4" :key="i" class="skeleton-form-item">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
    </div>

    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-header">
        <div v-for="i in 5" :key="i" class="skeleton-header-cell"></div>
      </div>
      <div v-for="i in rows" :key="i" class="skeleton-row">
        <div v-for="j in 5" :key="j" class="skeleton-cell"></div>
      </div>
    </div>

    <div v-else class="skeleton-text-block">
      <div v-for="i in rows" :key="i" class="skeleton-text"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'card', // card | list | form | table | text
    validator: (value: string) => ['card', 'list', 'form', 'table', 'text'].includes(value),
  },
  rows: {
    type: Number,
    default: 3,
  },
})

// 计算类名
const skeletonClasses = computed(() => [
  'skeleton-loader',
  `skeleton-${props.type}`,
])
</script>

<style scoped lang="scss">
$skeleton-bg: #f0f0f0;
$skeleton-light: #ffffff;
$animation-duration: 1.5s;

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-loader {
  animation: shimmer $animation-duration infinite;
  background: linear-gradient(
    90deg,
    $skeleton-bg 0%,
    $skeleton-light 50%,
    $skeleton-bg 100%
  );
  background-size: 1000px 100%;
}

// Card skeleton
.skeleton-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: white;

  .skeleton-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    background: $skeleton-bg;
  }

  .skeleton-content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .skeleton-title {
      height: 20px;
      border-radius: 4px;
      background: $skeleton-bg;
      width: 80%;
    }

    .skeleton-text {
      height: 16px;
      border-radius: 4px;
      background: $skeleton-bg;

      &.short {
        width: 60%;
      }
    }
  }
}

// List skeleton
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .skeleton-item {
    display: flex;
    gap: 12px;
    padding: 12px;
    background: white;
    border-radius: 8px;

    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      flex-shrink: 0;
      background: $skeleton-bg;
    }

    .skeleton-content-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      .skeleton-title {
        height: 18px;
        border-radius: 4px;
        background: $skeleton-bg;
        width: 70%;
      }

      .skeleton-text {
        height: 14px;
        border-radius: 4px;
        background: $skeleton-bg;
        width: 100%;
      }
    }
  }
}

// Form skeleton
.skeleton-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;

  .skeleton-form-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .skeleton-label {
      height: 16px;
      border-radius: 4px;
      background: $skeleton-bg;
      width: 20%;
    }

    .skeleton-input {
      height: 40px;
      border-radius: 4px;
      background: $skeleton-bg;
    }
  }
}

// Table skeleton
.skeleton-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;

  .skeleton-header {
    display: flex;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;

    .skeleton-header-cell {
      flex: 1;
      height: 48px;
      padding: 12px;
      background: $skeleton-bg;
      border-right: 1px solid #f0f0f0;

      &:last-child {
        border-right: none;
      }
    }
  }

  .skeleton-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;

    .skeleton-cell {
      flex: 1;
      height: 48px;
      padding: 12px;
      background: $skeleton-bg;
      border-right: 1px solid #f0f0f0;

      &:last-child {
        border-right: none;
      }
    }
  }
}

// Text block skeleton
.skeleton-text-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;

  .skeleton-text {
    height: 16px;
    border-radius: 4px;
    background: $skeleton-bg;

    &:last-child {
      width: 80%;
    }
  }
}

@media (max-width: 768px) {
  .skeleton-card {
    .skeleton-image {
      height: 150px;
    }
  }

  .skeleton-list {
    .skeleton-item {
      .skeleton-avatar {
        width: 40px;
        height: 40px;
      }
    }
  }
}
</style>
