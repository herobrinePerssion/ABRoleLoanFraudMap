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
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    host: true,
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
        // 手动分块配置 - 使用 id 分组，避免直接声明 .vue 文件导致解析问题
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('element-plus') || id.includes('@element-plus')) {
              return 'vendor-element'
            }
            if (id.includes('vue-router') || id.includes('/vue/')) {
              return 'vendor-core'
            }
            return 'vendor'
          }

          if (id.includes('/src/views/')) {
            if (id.includes('/Report') || id.includes('/ReportSuccess')) return 'chunk-report'
            if (id.includes('/Cases') || id.includes('/Detail')) return 'chunk-cases'
            if (id.includes('/Feedback') || id.includes('/Profile') || id.includes('/Search')) return 'chunk-user'
            if (id.includes('/Quiz') || id.includes('/Help') || id.includes('/Policy')) return 'chunk-education'
          }

          if (id.includes('/src/services/')) return 'chunk-services'
          if (id.includes('/src/constants/')) return 'chunk-utils'
          if (id.includes('/src/components/')) return 'chunk-components'
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

  },
})
