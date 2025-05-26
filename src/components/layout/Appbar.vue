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

const { mdAndDown } = useDisplay()

const baseStore = useBaseStore()
const vuetifyTheme = useTheme()
const { globalLoader, theme, drawer } = storeToRefs(baseStore)

const authStore = useAuthStore()
const { clearUser } = authStore
const { user } = storeToRefs(authStore)

const router = useRouter()
const auth = useFirebaseAuth()

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
