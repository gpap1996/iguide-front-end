import { createI18n } from 'vue-i18n'

// Import translations directly
import enMessages from './locales/en.js'
import elMessages from './locales/el.js'

// Create i18n instance with default locale and messages
const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: 'el', // Default locale, will be updated after store initialization
  fallbackLocale: 'en', // Fallback to English if translation is missing
  messages: {
    en: enMessages,
    el: elMessages,
  },
})

// Function to set the locale
export async function setI18nLanguage(locale) {
  // Set the locale
  i18n.global.locale.value = locale

  // Set the HTML lang attribute
  document.querySelector('html').setAttribute('lang', locale)

  return locale
}

// Function to initialize i18n with store language
export async function initializeI18n(storeLocale) {
  if (storeLocale && storeLocale !== i18n.global.locale.value) {
    await setI18nLanguage(storeLocale)
  }
}

export default i18n
