import { createRouter, createWebHistory } from 'vue-router'

import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import HomeView from '@/views/HomeView.vue'
import { checkAuth } from '@/lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      alias: '/',
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
        showSidebar: true,
        showHeader: true,
      },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      alias: '/',
      meta: {
        requiresAuth: false,
        showSidebar: false,
        showHeader: false,
      },
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: {
        requiresAuth: true,
        showSidebar: true,
        showHeader: true,
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: {
        requiresAuth: false,
        showSidebar: false,
        showHeader: false,
      },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const { session } = await checkAuth()
  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (!to.meta.requiresAuth && session) {
    next('/profile?section=basic')
  } else {
    next()
  }
})

export default router
