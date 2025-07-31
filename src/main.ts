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
createApp(App)
  .use(router)
  .mount('#app')