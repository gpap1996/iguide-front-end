<template>
  <div class="component-wrapper d-flex align-center justify-center">
    <v-form @submit.prevent="onLogin" style="min-width: 400px" class="d-flex flex-column">
      <v-text-field v-model="email" label="Email" type="email"> </v-text-field>
      <v-text-field v-model="password" label="Password" type="password"> </v-text-field>
      <v-btn type="submit" color="primary">Login </v-btn>
    </v-form>
  </div>
</template>

<script setup>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'

const router = useRouter()
const auth = useFirebaseAuth()
const email = ref(null)
const password = ref(null)

const onLogin = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (error) {
    console.log(error)
    //todo snackbar
  }
}
</script>

<style lang="scss" scoped></style>
