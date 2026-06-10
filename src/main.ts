/*
 * @Author: arron Zhu
 * @Date: 2025-07-26 17:31:45
 * @lastEditor: arron Zhu
 * @LastEditTime: 2025-07-27 00:39:35
 * @Description:
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import '@/styles/global.scss'
import { initMockApi } from '@/services/mockApi'
import { reportWebVitals, monitorPagePerformance } from '@/utils/performance'

// 初始化 Mock API 拦截器
initMockApi()

// 开启性能监测（生产环境）
if (import.meta.env.PROD) {
  // 报告 Web Vitals 指标
  reportWebVitals((metrics) => {
    console.log('Performance Metrics:', metrics)
    // 可以在这里将指标发送到分析服务
  })
}

// 开启页面性能监控
monitorPagePerformance()

const app = createApp(App)
app.use(router).mount('#app')
