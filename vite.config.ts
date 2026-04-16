/*
 * @Author: arron Zhu
 * @Date: 2025-07-26 23:35:55
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-08-01 00:39:59
 * @Description: Vite 配置 - 支持代码分割和性能优化
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router'],
      include: [
        /\.[tj]sx?$/,
        /\.vue$/,
        /\.vue\?vue/,
      ],
      vueTemplate: true,
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),

    Components({
      resolvers: [ElementPlusResolver({ directives: true })],
      dts: 'src/components.d.ts',
    }),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables.scss" as *;`,
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    port: 3000,
    open: true,
  },

  // 构建优化配置
  build: {
    // 提高分块大小警告阈值 (默认 500kb)
    chunkSizeWarningLimit: 1000,

    // 高级分块策略
    rollupOptions: {
      output: {
        // 手动分块配置 - 将大文件按功能模块分离
        manualChunks: {
          // 核心依赖库 - Vue生态
          'vendor-core': ['vue', 'vue-router'],

          // Element Plus UI库 - 单独分块以便缓存
          'vendor-element': ['element-plus', '@element-plus/icons-vue'],

          // 业务页面分组 - 举报流程
          'chunk-report': ['src/views/Report.vue', 'src/views/ReportSuccess.vue'],

          // 业务页面分组 - 案例相关
          'chunk-cases': ['src/views/Cases.vue', 'src/views/Detail.vue'],

          // 业务页面分组 - 用户交互
          'chunk-user': [
            'src/views/Feedback.vue',
            'src/views/Profile.vue',
            'src/views/Search.vue',
          ],

          // 业务页面分组 - 教育内容
          'chunk-education': ['src/views/Quiz.vue', 'src/views/Help.vue', 'src/views/Policy.vue'],

          // 业务服务层
          'chunk-services': [
            'src/services/apiClient.ts',
            'src/services/mockApi.ts',
            'src/services/reportService.ts',
          ],

          // 工具和常量
          'chunk-utils': ['src/constants/report.ts', 'src/constants/cases.ts'],

          // 公共组件库
          'chunk-components': [
            'src/components/EmptyState.vue',
            'src/components/ErrorState.vue',
            'src/components/SkeletonLoader.vue',
            'src/components/LoadingSpinner.vue',
            'src/components/FooterBar.vue',
          ],
        },

        // 优化输出文件名 - 按类型分目录
        entryFileNames: 'js/[name]-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          if (/png|jpe?g|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`
          } else if (/woff|woff2|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`
          } else if (ext === 'css') {
            return `css/[name]-[hash][extname]`
          }
          return `assets/[name]-[hash][extname]`
        },
      },
    },

    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
})
