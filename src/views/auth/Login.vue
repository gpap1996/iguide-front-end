<template>
  <div class="d-flex-column d-lg-flex flex-grow-1" style="width: 100vw; min-width: 100vh">
    <!-- 1st column -->
    <div class="left-column d-flex flex-grow-1" style="overflow: hidden; position: relative">
      <div class="d-flex flex-column align-center justify-center flex-grow-1">
        <div>
          <div class="left-column-title">iGuide</div>
          <div class="left-column-subtitle">Ψηφιακή διαδραστική ξενάγηση</div>
        </div>
      </div>
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
    <!-- 2nd-column -->
    <div class="d-flex flex-column align-center justify-center flex-grow-1">
      <div class="text-start mb-10" style="width: 50%">
        <div class="title">Γεια και πάλι</div>
        <div class="subtitle">Καλώς Ήρθατε</div>
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
          label="Κωδικός"
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
  background: linear-gradient(to bottom, #0b7fe7, #021b79);
}

.left-column-title {
  font-weight: bold;
  font-size: 80px;
  line-height: 80px;
  color: white;
}

.left-column-subtitle {
  font-weight: semi-bold;
  font-size: 36px;
  color: white;
  //   line-height: 80px;
}
</style>
