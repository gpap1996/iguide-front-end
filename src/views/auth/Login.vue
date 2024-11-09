<template>
  <div class="d-flex-column d-lg-flex" style="width: 100vw; min-height: 100vh">
    <!-- 1st column -->
    <div class="left-column d-flex flex-grow-1" style="overflow: hidden; position: relative">
      <div class="d-flex flex-column align-center justify-center flex-grow-1">
        <div>
          <div class="left-column-title">Northern Lights</div>
          <div class="left-column-subtitle">Digital interactive tour.</div>
          <v-img
            :width="580"
            :height="350"
            aspect-ratio="16/9"
            cover
            src="/images/login-card.jpg"
            class="rounded-xl mt-10"
          ></v-img>
        </div>
      </div>

      <!-- <div class="circle circle-1"></div>
      <div class="circle circle-2"></div> -->
    </div>
    <!-- 2nd-column -->
    <div class="d-flex flex-column align-center justify-center flex-grow-1">
      <div class="text-start mb-10" style="width: 50%">
        <div class="title">Hello again,</div>
        <div class="subtitle">Welcome Back!</div>
      </div>

      <v-form @submit.prevent="onLogin" class="d-flex flex-column" style="width: 50%">
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
import { signInWithEmailAndPassword } from 'firebase/auth'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFirebaseAuth } from 'vuefire'

const router = useRouter()
const auth = useFirebaseAuth()
const email = ref(null)
const password = ref(null)
const loginLoader = ref(false)
const onLogin = async () => {
  loginLoader.value = true

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    router.push('/')
  } catch (error) {
    console.log(error)
    //todo snackbar
  } finally {
    loginLoader.value = false
  }
}
</script>

<style lang="scss" scoped>
/* Base styles for each circle */
.circle {
  position: absolute;
  width: 800px; /* Large size to allow border-radius to create a circular edge */
  height: 800px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2); /* Light border to create arc effect */
  background: transparent;
}

/* First arc */
.circle-1 {
  bottom: -300px; /* Position to create arc */
  left: -300px;
  border-width: 3px;
  opacity: 0.4;
}

/* Second arc */
.circle-2 {
  bottom: -400px;
  left: -150px;
  border-width: 3px;
  opacity: 0.4;
}

.left-column {
  border-right: 2px solid rgb(var(--v-theme-surface));
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
</style>
