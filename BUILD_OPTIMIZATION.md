# 代码分割和性能优化指南

## 📊 Vite 构建配置优化

### 1. **Manual Chunks 配置**

已在 `vite.config.ts` 中配置以下分块策略：

```
vendor-core          → Vue + Vue Router 核心库
vendor-element       → Element Plus UI 框架
chunk-report         → 举报流程相关页面
chunk-cases          → 案例列表和详情页面
chunk-user           → 用户相关功能（反馈、个人中心、搜索）
chunk-education      → 教育内容（防骗自测、帮助、隐私）
chunk-services       → 业务服务层（API、Model、报告服务）
chunk-utils          → 工具函数和常量
chunk-components     → 公共UI组件
```

### 2. **Chunk Size Warning Limit**

- **旧值**: 500 KB（默认）
- **新值**: 1000 KB
- **原因**: 应用体量较大，需要提高警告阈值

### 3. **输出文件结构**

```
dist/
├── js/
│   ├── main-xxx.js          (主应用代码)
│   ├── vendor-core-xxx.js   (Vue 核心库)
│   ├── vendor-element-xxx.js (Element Plus)
│   ├── chunk-report-xxx.js
│   ├── chunk-cases-xxx.js
│   ├── chunk-user-xxx.js
│   ├── chunk-education-xxx.js
│   ├── chunk-services-xxx.js
│   ├── chunk-utils-xxx.js
│   └── chunk-components-xxx.js
├── css/
│   ├── main-xxx.css
│   └── ...
├── images/
└── fonts/
```

---

## 🚀 动态导入（Lazy Loading）

### 路由级别的代码分割

在 `src/router/index.ts` 中已实现：

```typescript
// 首页立即加载（用户最常访问）
import Home from '@/views/home/index.vue'

// 其他页面使用动态导入
const About = () => import('@/views/About.vue')
const Report = () => import('@/views/Report.vue')
const Cases = () => import('@/views/Cases.vue')
// ... 更多页面
```

### 优势

1. **初始包体积减少** - 首屏只加载必要代码
2. **并行加载** - 不同路由代码并行加载，不阻塞主线程
3. **浏览器缓存** - 分离的 chunk 文件可单独缓存
4. **按需加载** - 用户导航时才加载对应模块

---

## 📈 性能监测

### Web Vitals 指标

已在 `src/utils/performance.ts` 中实现以下指标监测：

| 指标 | 含义 | 目标 | 测量方法 |
|------|------|------|---------|
| **FCP** | 首次内容绘制 | < 1.8s | PerformanceObserver |
| **LCP** | 最大内容绘制 | < 2.5s | PerformanceObserver |
| **FID** | 首次输入延迟 | < 100ms | PerformanceObserver |
| **CLS** | 累积布局偏移 | < 0.1 | PerformanceObserver |
| **TTFB** | 首字节时间 | < 600ms | performance.timing |

### 使用方法

```typescript
import { reportWebVitals, monitorPagePerformance } from '@/utils/performance'

// 报告 Web Vitals 指标
reportWebVitals((metrics) => {
  console.log('性能指标:', metrics)
  // 发送到分析服务
})

// 监控页面性能
monitorPagePerformance()
```

### 自定义性能追踪

```typescript
import { PerformanceTracker } from '@/utils/performance'

const tracker = new PerformanceTracker()

// 标记时间点
tracker.mark('operation-start')
// ... 执行操作
tracker.mark('operation-end')

// 测量时间差
tracker.measure('操作耗时', 'operation-start', 'operation-end')
```

---

## 🔧 构建命令

### 开发环境
```bash
pnpm dev
```

### 生产构建（带优化）
```bash
pnpm build
```

输出信息示例：
```
✓ 1234 modules transformed
dist/js/main-abc123.js         250.5 kb
dist/js/vendor-core-xyz789.js  180.2 kb
dist/js/chunk-cases-def456.js  120.8 kb
dist/js/vendor-element-ghi789.js 450.3 kb ⚠️ (大于阈值)
dist/css/main-jkl012.css       45.2 kb
```

### 预览构建结果
```bash
pnpm preview
```

---

## 📊 Bundle 分析

### 生成 Bundle 分析报告

安装 rollup-plugin-visualizer：
```bash
pnpm add -D rollup-plugin-visualizer
```

在 vite.config.ts 中添加：
```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    // ... 其他插件
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    })
  ]
})
```

运行构建后会自动打开可视化报告。

---

## ⚡ 性能优化建议

### 1. 浏览器缓存策略
```
- vendor-core.js     → 1 年（几乎不变）
- vendor-element.js  → 1 年（几乎不变）
- chunk-*.js         → 30 天（业务逻辑可能变化）
- main.js            → 不缓存或 1 天（入口文件经常更新）
```

### 2. 预加载重要 chunks
```html
<!-- 在 index.html 中 -->
<link rel="prefetch" href="/js/vendor-core-xxx.js">
<link rel="prefetch" href="/js/vendor-element-xxx.js">
<link rel="preload" href="/js/main-xxx.js" as="script">
```

### 3. 启用 Gzip 压缩（服务器配置）
```nginx
# Nginx 示例
gzip on;
gzip_types text/plain text/css application/javascript;
gzip_min_length 1000;
```

### 4. 使用 CDN 加速
- 静态资源（images、fonts）上传到 CDN
- 在 vite.config.ts 中配置 CDN 路径

### 5. 条件导入和 Tree-shaking
```typescript
// ✅ 好 - 会被 tree-shake 移除
import { isEmpty } from 'lodash-es'

// ❌ 差 - 整个库都会被打包
import * as _ from 'lodash'
```

---

## 📋 性能目标清单

- [ ] First Contentful Paint (FCP) < 1.8s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] First Input Delay (FID) < 100ms
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] 首屏 JavaScript < 200 KB (gzip)
- [ ] 首屏 CSS < 50 KB (gzip)
- [ ] 所有 chunk 文件 < 500 KB

---

## 🔍 检查清单

运行以下命令验证构建质量：

```bash
# 1. 构建应用
pnpm build

# 2. 检查构建结果
ls -lh dist/js/

# 3. 测试应用
pnpm preview

# 4. 性能测试（使用 Lighthouse）
# 在 Chrome DevTools 中运行 Lighthouse 审核
```

---

## 相关文档

- [Vite 官方文档](https://vitejs.dev/)
- [Rollup Manual Chunks](https://rollupjs.org/configuration-options/#output-manualchunks)
- [Web Vitals](https://web.dev/vitals/)
- [Core Web Vitals](https://web.dev/core-web-vitals/)
