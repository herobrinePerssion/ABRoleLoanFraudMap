import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home/index.vue'
import About from '@/views/About.vue'
const routes = [
  { path: '/', name: 'index', 
  redirect: '/home',
  children: [
   {
     path: 'home',
     name: 'homepage',
      component: Home
    },
  ]
   },
  { path: '/about', name: 'about', component: About },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router