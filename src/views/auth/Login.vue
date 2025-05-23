<template>
  <div
    class="d-flex flex-column flex-lg-row"
    style="width: 100vw"
    :style="isMobile ? 'min-height:500px' : 'min-height:100vh'"
  >
    <div class="aurora-background" v-if="!isMobile">
      <div class="aurora-circle purple"></div>
      <div class="aurora-circle green"></div>
      <div class="aurora-circle teal"></div>
    </div>
    <!-- 1st column -->
    <div class="left-column d-flex flex-grow-1" style="overflow: hidden; position: relative">
      <div class="d-flex flex-column align-center justify-center flex-grow-1">
        <div :class="{ 'text-center': isMobile }">
          <div class="left-column-title">i•Guide</div>
          <div class="left-column-subtitle">Digital interactive tour•</div>
        </div>
      </div>
    </div>
    <!-- 2nd-column -->
    <div class="d-flex flex-column align-center justify-center flex-grow-1">
      <div v-if="!isMobile" class="text-start mb-10" style="width: 50%">
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
import { useBaseStore } from '@/stores/base'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
import { useDisplay } from 'vuetify'

const baseStore = useBaseStore()
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
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/home')
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
</script>

<style lang="scss" scoped>
.left-column {
  border-right: 2px solid rgb(var(--v-theme-oposite), 0.1);
}

.left-column-title {
  font-weight: bold;
  font-size: 80px;
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

.left-column-subtitle {
  font-weight: 400;
  font-size: 32px;
  // color: white;
  //   line-height: 80px;
}

.aurora-background {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.aurora-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.6;
}

.aurora-circle.purple {
  top: 80px;
  left: 5%;
  width: 256px;
  height: 256px;
  background-color: rgb(var(--v-theme-primary));
}

.aurora-circle.green {
  top: 160px;
  right: 50%;
  width: 384px;
  height: 384px;
  background-color: rgb(var(--v-theme-success));
}

.aurora-circle.teal {
  bottom: 80px;
  left: 14%;
  width: 288px;
  height: 288px;
  background-color: rgb(var(--v-theme-error));
}
</style>
