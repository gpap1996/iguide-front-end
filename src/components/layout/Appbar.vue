<template>
  <v-app-bar>
    <v-app-bar-title> iGuide </v-app-bar-title>

    <v-btn icon="mdi-logout" @click="onLogout"> </v-btn>
  </v-app-bar>
</template>

<script setup>
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
const router = useRouter()
const auth = useFirebaseAuth()
const onLogout = async () => {
  await signOut(auth)
  router.push('/login')
}
</script>

<style lang="scss" scoped></style>
