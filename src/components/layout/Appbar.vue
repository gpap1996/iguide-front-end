<template>
  <v-app-bar extension-height="4">
    <template v-slot:prepend>
      <v-app-bar-nav-icon v-if="isMobile" @click="drawer = !drawer"></v-app-bar-nav-icon>

      <div class="logo-title ml-2">Northern Lights</div>
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
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
import { useTheme, useDisplay } from 'vuetify'

const { mdAndDown } = useDisplay()

const vuetifyTheme = useTheme()
const { globalLoader, theme, drawer } = storeToRefs(useBaseStore())
const router = useRouter()
const auth = useFirebaseAuth()

const onLogout = async () => {
  await signOut(auth)
  router.push('/')
}

const onToogleTheme = () => {
  vuetifyTheme.global.name.value = theme.value === 'light' ? 'dark' : 'light'
  theme.value = vuetifyTheme.global.name.value
}

const isMobile = computed(() => mdAndDown.value)
</script>

<style lang="scss" scoped>
.logo-title {
  font-weight: bold;
  font-size: 30px;
  line-height: 90px;
  color: transparent;
  background: linear-gradient(
    to right,
    rgb(var(--v-theme-primary)),
    rgb(var(--v-theme-success)),
    rgb(var(--v-theme-error))
  );

  background-clip: text;
}
</style>
