// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

export const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    variations: {
      colors: ['primary', 'secondary', 'background'],
      lighten: 2,
      darken: 2,
    },
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#5DAE8B',
          background: '#F0F8FF',
          success: '#66D9E8',
          error: '#FF6B6B',
        },
      },
      dark: {
        dark: true,
        colors: {
          primary: '#00B894',
          // background: '#1A1A2E',
          success: '#3DB8CC',
          error: '#D83A56',
        },
      },
    },
  },
})
