import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import router from './router'

import { initializeApp } from 'firebase/app'
import { VueFire, VueFireAuth } from 'vuefire'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyDNl4-jg9yzfSmXy89Sblw8ZdNX8wJJYNI',
  authDomain: 'iguide-demo.firebaseapp.com',
  projectId: 'iguide-demo',
  storageBucket: 'iguide-demo.firebasestorage.app',
  messagingSenderId: '251387545799',
  appId: '1:251387545799:web:25da92d8b677c15e3e96e2',
})

const app = createApp(App)
const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
})

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    VueFireAuth(),
  ],
})

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.mount('#app')
