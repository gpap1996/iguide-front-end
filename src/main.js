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
import { getIdToken } from 'firebase/auth'
import { MotionPlugin } from '@vueuse/motion'
import { VueQueryPlugin } from '@tanstack/vue-query'

import axios from 'axios'
export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDNl4-jg9yzfSmXy89Sblw8ZdNX8wJJYNI',
  authDomain: 'iguide-demo.firebaseapp.com',
  projectId: 'iguide-demo',
  storageBucket: 'iguide-demo.firebasestorage.app',
  messagingSenderId: '251387545799',
  appId: '1:251387545799:web:25da92d8b677c15e3e96e2',
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
app.use(router)
app.use(vuetify)
app.use(vuetifyProTipTap)
app.use(MotionPlugin)
app.use(VueQueryPlugin)

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
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optionally, clear axios authorization header if set
      delete axios.defaults.headers.common['Authorization']

      // Redirect to login page
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

app.mount('#app')
