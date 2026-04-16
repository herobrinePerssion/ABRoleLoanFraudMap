import { createRouter, createWebHistory } from 'vue-router'

// 首页 - 立即加载（用户最可能访问）
import Home from '@/views/home/index.vue'

// 懒加载其他页面 - 使用 dynamic import 实现代码分割
// 这样每个路由的代码只在用户访问时才加载
const About = () => import('@/views/About.vue')
const Report = () => import('@/views/Report.vue')
const ReportSuccess = () => import('@/views/ReportSuccess.vue')
const Stats = () => import('@/views/Stats.vue')
const Quiz = () => import('@/views/Quiz.vue')
const Cases = () => import('@/views/Cases.vue')
const Detail = () => import('@/views/Detail.vue')
const Help = () => import('@/views/Help.vue')
const Policy = () => import('@/views/Policy.vue')
const Search = () => import('@/views/Search.vue')
const Feedback = () => import('@/views/Feedback.vue')
const Profile = () => import('@/views/Profile.vue')

// 路由配置
const routes = [
  { path: '/', redirect: '/home' },
  {
    path: '/home',
    name: 'homepage',
    component: Home,
    meta: { title: '首页 - AB贷全国诈骗地图' },
  },
  {
    path: '/about',
    name: 'about',
    component: About,
    meta: { title: '关于AB贷' },
  },
  {
    path: '/report',
    name: 'report',
    component: Report,
    meta: { title: '举报入口' },
  },
  {
    path: '/report/success',
    name: 'reportSuccess',
    component: ReportSuccess,
    meta: { title: '举报成功' },
  },
  {
    path: '/stats',
    name: 'stats',
    component: Stats,
    meta: { title: '数据统计' },
  },
  {
    path: '/quiz',
    name: 'quiz',
    component: Quiz,
    meta: { title: '防骗自测' },
  },
  {
    path: '/cases',
    name: 'cases',
    component: Cases,
    meta: { title: '案例列表' },
  },
  {
    path: '/cases/:id',
    name: 'caseDetail',
    component: Detail,
    meta: { title: '案例详情' },
  },
  {
    path: '/help',
    name: 'help',
    component: Help,
    meta: { title: '帮助中心' },
  },
  {
    path: '/policy',
    name: 'policy',
    component: Policy,
    meta: { title: '隐私声明' },
  },
  {
    path: '/search',
    name: 'search',
    component: Search,
    meta: { title: '搜索' },
  },
  {
    path: '/feedback',
    name: 'feedback',
    component: Feedback,
    meta: { title: '用户反馈' },
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile,
    meta: { title: '个人中心' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由元信息处理 - 更新页面标题
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'AB贷全国诈骗地图'
})

export default router
