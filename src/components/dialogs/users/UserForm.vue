<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ user ? $t('users.edit') : $t('users.create') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="isFormValid">
        <v-text-field
          v-model="form.username"
          density="comfortable"
          variant="outlined"
          :label="$t('users.username')"
          :rules="[rules.required]"
          tabindex="1"
        ></v-text-field>
        <v-text-field
          v-model="form.email"
          density="comfortable"
          variant="outlined"
          :label="$t('users.email')"
          type="email"
          :rules="[rules.required, rules.email]"
          class="mt-4"
          autocomplete="new-password"
          tabindex="2"
        ></v-text-field>
        <div class="d-flex" style="gap: 16px">
          <v-text-field
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            density="comfortable"
            variant="outlined"
            :label="$t('users.password')"
            :rules="rules.password"
            class="mt-4"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showPassword = !showPassword"
            autocomplete="new-password"
            max-width="310px"
            tabindex="3"
          ></v-text-field>

          <v-text-field
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            density="comfortable"
            variant="outlined"
            :label="$t('users.confirmPassword')"
            :rules="[user ? rules.passwordMatch : rules.required, rules.passwordMatch]"
            class="mt-4"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
            autocomplete="new-password"
            :disabled="!form.password"
            max-width="310px"
            tabindex="4"
          ></v-text-field>
        </div>

        <div class="d-flex" style="gap: 16px">
          <v-text-field
            v-model="form.firstName"
            density="comfortable"
            variant="outlined"
            :label="$t('users.firstName')"
            :rules="[rules.required]"
            class="mt-4"
            autocomplete="new-name"
            max-width="310px"
            tabindex="5"
          ></v-text-field>

          <v-text-field
            v-model="form.lastName"
            density="comfortable"
            variant="outlined"
            :label="$t('users.lastName')"
            :rules="[rules.required]"
            class="mt-4"
            autocomplete="new-name"
            max-width="310px"
            tabindex="6"
          ></v-text-field>
        </div>

        <v-autocomplete
          v-model="form.projectId"
          :items="projects"
          item-title="name"
          item-value="id"
          density="comfortable"
          variant="outlined"
          :label="$t('users.project')"
          :rules="[rules.required]"
          class="mt-4"
          :loading="isProjectsLoading"
          :no-data-text="$t('users.noProjectsAvailable')"
          tabindex="7"
        ></v-autocomplete>

        <v-radio-group
          v-model="form.role"
          :label="$t('users.role')"
          inline
          :rules="[rules.required]"
          class="mt-4"
          tabindex="8"
        >
          <v-radio value="manager" :label="$t('users.manager')"></v-radio>
        </v-radio-group>
      </v-form>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        :text="$t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        :text="$t('common.save')"
        variant="flat"
        @click="onSubmitUser"
        :loading="isSubmitting"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { user, projects } = defineProps({ user: Object, projects: Array })
const emits = defineEmits(['close', 'reset'])

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)

const formRef = ref(null)
const isFormValid = ref(false)
const isSubmitting = ref(false)
const isProjectsLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  projectId: null,
  role: 'manager',
})

const rules = {
  required: (value) => !!value || t('validation.required'),
  email: (value) => {
    const pattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/
    return pattern.test(value) || t('validation.email')
  },
  passwordMatch: (value) =>
    !value ||
    !form.value.password ||
    value === form.value.password ||
    t('validation.passwordMatch'),
  password: [
    // Only require password for new users (not when editing)
    (value) => user || !!value || t('validation.passwordRequired'),
    (value) => !value || value.length >= 5 || t('validation.passwordLength'),
    (value) => !value || value.length <= 12 || t('validation.passwordMaxLength'),
    (value) => !value || /[a-z]/.test(value) || t('validation.passwordLowercase'),
    (value) => !value || /[A-Z]/.test(value) || t('validation.passwordUppercase'),
    (value) => !value || /[^A-Za-z0-9]/.test(value) || t('validation.passwordSymbol'),
  ],
}

onMounted(async () => {
  // Initialize form with user data if editing
  if (user) {
    form.value = { ...user }
  }
})

const onSubmitUser = async () => {
  // Manually validate form
  const { valid } = await formRef.value.validate()

  if (!valid) {
    // Show validation error in snackbar
    snackbar.value = {
      show: true,
      text: t('users.fillRequiredFields'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
    return
  }
  isSubmitting.value = true
  try {
    // Create a copy of the form data without the confirmPassword field
    const userData = { ...form.value }
    delete userData.confirmPassword

    // For existing users, only send the password if it was changed
    if (user && !userData.password) {
      delete userData.password
    }

    if (user) {
      await axios.put(`/users/${user.id}`, userData)
    } else {
      await axios.post('/users', userData)
    }

    snackbar.value = {
      show: true,
      text: user ? t('users.editSuccess') : t('users.addSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error?.response?.data?.error?.message}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style lang="scss" scoped></style>
