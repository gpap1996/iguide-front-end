<template>
  <div
    class="d-flex flex-column flex-lg-row"
    style="width: 100vw"
    :style="isMobile ? 'min-height:500px' : 'min-height:100vh'"
  >
    <!-- 1st column -->
    <div class="left-column d-flex flex-grow-1" v-if="!isMobile">
      <div class="particles-wrapper">
        <vue-particles
          @particles-loaded="particlesLoaded"
          id="tsparticles"
          :options="{
            background: {
              color: {
                value: 'transparent',
              },
            },
            fpsLimit: 60,
            interactivity: {
              events: {
                onHover: {
                  enable: true,
                  mode: 'grab',
                },
              },
              modes: {
                grab: {
                  distance: 140,
                  links: {
                    opacity: 0.5,
                  },
                },
              },
            },
            particles: {
              color: {
                value: ['#5DAE8B', '#8BC4B0', '#B8D9CC'],
              },
              links: {
                color: '#5DAE8B',
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              move: {
                direction: 'none',
                enable: true,
                outModes: {
                  default: 'bounce',
                },
                random: true,
                speed: { min: 0.5, max: 2 },
                straight: false,
                path: {
                  enable: true,
                  delay: {
                    value: 0.1,
                  },
                  options: {
                    size: 5,
                    draw: false,
                    increment: 0.001,
                  },
                },
              },
              number: {
                density: {
                  enable: true,
                  area: 1200,
                },
                value: 60,
              },
              opacity: {
                value: { min: 0.3, max: 0.8 },
              },
              shape: {
                type: ['circle', 'triangle'],
              },
              size: {
                value: { min: 1, max: 3 },
                animation: {
                  enable: true,
                  speed: 2,
                  minimumValue: 0.1,
                  sync: false,
                },
              },
            },
            detectRetina: true,
            fullScreen: {
              enable: true,
              zIndex: -1,
            },
          }"
        />
      </div>
      <div class="content-wrapper">
        <div :class="{ 'text-center': isMobile }">
          <div class="logo">
            <div class="logo-wrapper">
              <div class="logo-i">i</div>
              <div class="logo-dot"></div>
              <div class="logo-guide">
                <span class="guide-letter" v-for="(letter, index) in 'GUIDE'" :key="index">
                  {{ letter }}
                </span>
              </div>
            </div>
          </div>
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
import { signInWithEmailAndPassword } from 'firebase/auth'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'
import { useDisplay } from 'vuetify'

const authStore = useAuthStore()
// const { isAdmin, isManager } = authStore
const { role, isAdmin, isManager } = storeToRefs(authStore)
const particlesLoaded = async (container) => {
  console.log('Particles container loaded', container)
}
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
.particles-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 50vw;
  height: 100vh;
  z-index: -1;
  pointer-events: none;
}

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

.left-column-title {
  font-weight: bold;
  font-size: 80px;
  line-height: 90px;
}

.left-column-subtitle {
  font-weight: 400;
  font-size: 32px;
  margin-top: 5px;
  color: rgb(var(--v-theme-oposite));
  opacity: 0;
  animation: fadeIn 1s ease forwards 1s;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-i {
  font-size: 72px;
  font-weight: 900;
  position: relative;
  transform-origin: bottom;
  animation: stretch 2s ease-in-out infinite;
}

.logo-dot {
  width: 12px;
  height: 12px;
  background: rgb(var(--v-theme-oposite));

  border-radius: 50%;
  position: relative;
  animation: blink 2s ease-in-out infinite;
}

.logo-guide {
  display: flex;
  position: relative;
}

.guide-letter {
  font-size: 72px;
  font-weight: 900;
  opacity: 0;
  transform: translateY(20px);
  animation: slideUp 0.4s ease forwards;
}

.guide-letter:nth-child(1) {
  animation-delay: 0.1s;
}
.guide-letter:nth-child(2) {
  animation-delay: 0.2s;
}
.guide-letter:nth-child(3) {
  animation-delay: 0.3s;
}
.guide-letter:nth-child(4) {
  animation-delay: 0.4s;
}
.guide-letter:nth-child(5) {
  animation-delay: 0.5s;
}

@keyframes stretch {
  0%,
  100% {
    transform: scaleY(1);
  }
  50% {
    transform: scaleY(1.1);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

@keyframes slideUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
