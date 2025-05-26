<template>
  <div
    class="d-flex flex-column flex-lg-row"
    style="width: 100vw"
    :style="isMobile ? 'min-height:500px' : 'min-height:100vh'"
  >
    <!-- 1st column -->
    <div class="left-column d-flex flex-grow-1" v-if="!isMobile">
      <Particles />
      <div class="content-wrapper">
        <div :class="{ 'text-center': isMobile }">
          <Logo />
          <div class="left-column-subtitle">Digital interactive tour</div>
        </div>
      </div>
    </div>
    <!-- 2nd-column -->
    <div class="d-flex flex-column align-center justify-center flex-grow-1 bg-surface">
      <div class="mb-10" style="width: 50%" :class="{ 'text-center': isMobile }">
        <div class="title">Hello again,</div>
        <div class="subtitle">Welcome Back!</div>
      </div>

      <v-form
        @submit.prevent="onLogin"
        class="d-flex flex-column"
        style="width: 50%; min-width: 300px"
      >
        <v-text-field
          prepend-inner-icon="mdi-email"
          color="primary"
          variant="outlined"
          v-model="email"
          label="Email"
          type="email"
        >
        </v-text-field>
        <v-text-field
          prepend-inner-icon="mdi-lock"
          color="primary"
          variant="outlined"
          v-model="password"
          label="Password"
          type="password"
          style="font-family: 'Roboto'"
        >
        </v-text-field>
        <v-btn
          :loading="loginLoader"
          type="submit"
          color="primary"
          width="100%"
          size="x-large"
          class="mt-4 ml-auto rounded-lg"
          >Login
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useBaseStore } from '@/stores/base'
import axios from 'axios'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
import { useDisplay } from 'vuetify'
import Logo from '@/components/Logo.vue'
import Particles from '@/components/Particles.vue'

const authStore = useAuthStore()
const { role, isAdmin, isManager, user } = storeToRefs(authStore)

const baseStore = useBaseStore()
const { getLanguages } = baseStore
const { snackbar } = storeToRefs(baseStore)

const { mdAndDown } = useDisplay()
const router = useRouter()
const auth = useFirebaseAuth()
const email = ref(null)
const password = ref(null)
const loginLoader = ref(false)
const isMobile = computed(() => mdAndDown.value)

const onLogin = async () => {
  loginLoader.value = true

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value)
    const idTokenResult = await userCredential.user.getIdTokenResult()
    role.value = idTokenResult.claims.role

    const res = await axios.get(`/auth/user-profile`)
    const { user: fetchedUser } = res.data
    user.value = fetchedUser

    if (isAdmin.value) {
      router.push('/projects')
    } else if (isManager.value) {
      await getLanguages()
      router.push('/dashboard')
    } else {
      // Handle invalid role scenario
      throw new Error('Invalid user role')
    }
  } catch (error) {
    console.log(error)
    snackbar.value = {
      show: true,
      text: 'Invalid email or password',
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    loginLoader.value = false
  }
}

// onMounted(async () => {
//   await loadSlim(window.tsParticles)
// })
</script>

<style lang="scss" scoped>
.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-column {
  border-right: 2px solid rgb(var(--v-theme-oposite), 0.1);
  position: relative;
  overflow: hidden;
  flex: 1;
  max-width: 50%;
  height: 100vh;
}

@media (max-width: 960px) {
  .left-column {
    width: 100% !important;
    max-width: 100%;
    height: 500px;
  }
}

.left-column-subtitle {
  font-weight: 400;
  font-size: 32px;
  margin-top: 5px;
  color: rgb(var(--v-theme-oposite));
  opacity: 0;
  animation: fadeIn 1s ease forwards 1s;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
