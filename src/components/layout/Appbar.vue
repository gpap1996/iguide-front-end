<template>
  <v-app-bar extension-height="4">
    <v-app-bar-title> iGuide </v-app-bar-title>

    <v-btn icon="mdi-logout" @click="onLogout"> </v-btn>
    <template v-slot:extension>
      <v-progress-linear v-if="globalLoader" indeterminate color="primary"></v-progress-linear>
    </template>
  </v-app-bar>
</template>

<script setup>
import { useBaseStore } from '@/stores/base'
import { signOut } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'

const { globalLoader } = storeToRefs(useBaseStore())
const router = useRouter()
const auth = useFirebaseAuth()

const onLogout = async () => {
  await signOut(auth)
  router.push('/login')
}
</script>

<style lang="scss" scoped></style>
