import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser } from 'vuefire'
import { getIdTokenResult, signOut } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const auth = useFirebaseAuth()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/login',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

const authGuard = async (to, from, next) => {
  const { globalLoader } = storeToRefs(useBaseStore())
  const { requiresAuth } = to.meta
  globalLoader.value = true

  const user = await getCurrentUser()
  // Prevent logged-in users from going to the login page
  if (to.name === 'login' && user) {
    globalLoader.value = false
    next({ name: 'home' }) // Redirect logged-in users to home if they try to access the login page
    return
  }

  // Redirect to login if the route requires authentication and the user is not logged in
  if (requiresAuth && !user) {
    globalLoader.value = false
    next({ name: 'login' })
    return
  }

  if (user) {
    // Get the user's claims to check for the admin role
    const { claims } = await getIdTokenResult(user)

    // If the user is not an admin, log them out and redirect to login
    if (requiresAuth && claims?.role !== 'admin') {
      await signOut(auth)
      globalLoader.value = false
      next({ name: 'login' })
      return
    }

    // If the route does not require authentication and the user is an admin, redirect to home
    if (!requiresAuth && claims?.role === 'admin' && to.name !== 'home') {
      globalLoader.value = false
      next({ name: 'home' })
      return
    }
  }

  // Allow the navigation
  globalLoader.value = false
  next()
}

// Register the navigation guard
router.beforeEach(authGuard)
export default router
