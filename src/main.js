import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

import { vuetify } from './plugins/vuetify'
import { vuetifyProTipTap } from './plugins/tiptap'
import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth, getCurrentUser } from 'vuefire'
import { getIdToken, signOut } from 'firebase/auth'
import { MotionPlugin } from '@vueuse/motion'
import { VueQueryPlugin } from '@tanstack/vue-query'

import axios from 'axios'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import i18n, { initializeI18n } from './i18n'
import { useBaseStore } from './stores/base'

// Initialize Firebase with environment variables
export const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
})

const app = createApp(App)

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    VueFireAuth(),
  ],
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)

// Get the base store
const baseStore = useBaseStore()

// Initialize i18n with store language
initializeI18n(baseStore.currentLanguage).then(() => {
  // Use i18n after initialization
  app.use(i18n)

  // Use other plugins
  app.use(router)
  app.use(vuetify)
  app.use(vuetifyProTipTap)
  app.use(MotionPlugin)
  app.use(VueQueryPlugin)

  // Mount the app
  app.mount('#app')
})

// Set up axios default url and 401 interceptor
axios.defaults.baseURL = import.meta.env.VITE_API_URL

// Axios request interceptor to add Authorization header
axios.interceptors.request.use(
  async (config) => {
    const user = await getCurrentUser() // Get the current logged-in user

    if (user) {
      // If the user is logged in, get their Firebase ID token
      const idToken = await getIdToken(user)

      // Set the Authorization header with the token
      config.headers['Authorization'] = `Bearer ${idToken}`
    }

    return config // Always return the config object after modifying it
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally, clear axios authorization header if set
      delete axios.defaults.headers.common['Authorization']
      await signOut(firebaseApp.auth()) // Sign out the user if 401 error occurs
      // Redirect to login page
      router.push('/')
    }
    return Promise.reject(error)
  },
)

// Axios response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response
  },
  async (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore() // Access the store
      authStore.clearUser() // Call a method to clear role and user (you'll need to create this)

      // Optionally, clear axios authorization header if set
      delete axios.defaults.headers.common['Authorization']
      // Get the auth instance from firebaseApp if it's not directly available
      // This might vary depending on your Firebase setup, adjust if needed
      const authInstance = firebaseApp.auth ? firebaseApp.auth() : undefined
      if (authInstance) {
        await signOut(authInstance) // Sign out the user if 401 error occurs
      }
      // Redirect to login page
      router.push('/')
    }
    return Promise.reject(error)
  },
)
