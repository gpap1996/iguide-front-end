import { createRouter, createWebHistory } from 'vue-router'
import { getCurrentUser, useFirebaseAuth } from 'vuefire'
import { getIdTokenResult, signOut } from 'firebase/auth'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import adminRoutes from './adminRoutes'
import managerRoutes from './managerRoutes'

const auth = useFirebaseAuth()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/auth/Login.vue'),
      meta: { requiresAuth: false },
    },
    // Import manager and admin routes
    ...managerRoutes,
    ...adminRoutes,
    // Catch-all route for non-existent paths
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { requiresAuth: false }, // This route does not require authentication
    },
  ],
})

const authGuard = async (to, from, next) => {
  const { globalLoader } = storeToRefs(useBaseStore())
  const { requiresAuth, role: routeRole } = to.meta
  const user = await getCurrentUser()

  // Redirect to login if the route requires authentication and the user is not logged in
  if (requiresAuth && !user) {
    globalLoader.value = false
    next({ name: 'login' })
    return
  }

  if (user) {
    // Get the user's claims to check for role
    const { claims } = await getIdTokenResult(user)
    const userRole = claims?.role

    // Prevent logged-in users from going to the login page
    if (to.name === 'login') {
      globalLoader.value = false
      // Redirect to appropriate home page based on role
      if (userRole === 'admin') {
        next({ name: 'projects' }) // Admin home is projects page
      } else if (userRole === 'manager') {
        next({ name: 'dashboard' }) // Manager home is dashboard page
      } else {
        // Invalid role, log them out
        await signOut(auth)
        next({ name: 'login' })
      }
      return
    }

    // Check if user has access to this route
    if (requiresAuth && routeRole && routeRole !== userRole) {
      globalLoader.value = false
      // Redirect to appropriate home page based on role
      if (userRole === 'admin') {
        next({ name: 'projects' }) // Admin home is projects page
      } else if (userRole === 'manager') {
        next({ name: 'dashboard' }) // Manager home is dashboard page
      } else {
        // Invalid role, log them out
        await signOut(auth)
        next({ name: 'login' })
      }
      return
    }
  }

  // Handle non-existent routes
  if (to.name === 'not-found') {
    if (user) {
      const { claims } = await getIdTokenResult(user)
      // Redirect based on user role
      if (claims?.role === 'admin') {
        next({ name: 'projects' }) // Redirect admin to projects page
      } else if (claims?.role === 'manager') {
        next({ name: 'dashboard' }) // Redirect manager to dashboard
      } else {
        // Invalid role, log them out
        await signOut(auth)
        next({ name: 'login' })
      }
    } else {
      next({ name: 'login' }) // Redirect non-logged-in users to login
    }
    return
  }

  // Allow the navigation
  globalLoader.value = false
  next()
}

// Register the navigation guard
router.beforeEach(authGuard)
export default router
