<template>
  <v-app-bar extension-height="4">
    <template v-slot:prepend>
      <v-app-bar-nav-icon v-if="isMobile" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <img
        v-if="user?.project?.imageUrl"
        :src="user?.project?.imageUrl"
        width="100"
        height="auto"
        style="max-height: 60px; object-fit: contain"
      />
      <v-app-bar-title v-else> {{ user?.project?.name }}</v-app-bar-title>
    </template>

    <template v-slot:append>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-translate"
            class="mr-2"
            v-tooltip="$t('common.language')"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="lang in languages"
            :key="lang.locale"
            :value="lang.locale"
            @click="changeLanguage(lang.locale)"
          >
            <template v-slot:append>
              <v-icon
                v-if="currentLocale === lang.locale"
                color="primary"
                icon="mdi-check"
              ></v-icon>
            </template>
            <v-list-item-title>{{ lang.name }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-btn icon="mdi-theme-light-dark" @click="onToogleTheme"> </v-btn>
      <v-btn icon="mdi-logout" @click="onLogout"> </v-btn>
    </template>

    <template v-slot:extension>
      <v-progress-linear v-if="globalLoader" indeterminate color="primary"></v-progress-linear>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useBaseStore } from '@/stores/base'
import { useAuthStore } from '@/stores/auth'
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
import { useTheme, useDisplay } from 'vuetify'
import { useI18n } from 'vue-i18n'
import { setI18nLanguage } from '@/i18n'

const { mdAndDown } = useDisplay()
const { locale } = useI18n()

const baseStore = useBaseStore()
const { currentLanguage } = storeToRefs(baseStore)
const vuetifyTheme = useTheme()
const { globalLoader, theme, drawer } = storeToRefs(baseStore)

const authStore = useAuthStore()
const { clearUser } = authStore
const { user } = storeToRefs(authStore)

const router = useRouter()
const auth = useFirebaseAuth()

const languages = [
  { locale: 'el', name: 'Ελληνικά' },
  { locale: 'en', name: 'English' },
]

const currentLocale = computed(() => locale.value)

const changeLanguage = async (newLocale) => {
  await setI18nLanguage(newLocale)
  currentLanguage.value = newLocale
}

const onLogout = async () => {
  await signOut(auth)
  clearUser()
  router.push('/')
}

const onToogleTheme = () => {
  vuetifyTheme.global.name.value = theme.value === 'light' ? 'dark' : 'light'
  theme.value = vuetifyTheme.global.name.value
}

const isMobile = computed(() => mdAndDown.value)
</script>

<style lang="scss" scoped></style>
