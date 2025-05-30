<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ title }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <v-card-text class="pa-6">
      <div v-if="entityName" class="mb-4">
        <v-chip color="primary" variant="tonal" size="large" class="font-weight-bold">
          {{ entityName }}
        </v-chip>
      </div>

      <v-alert
        type="warning"
        variant="tonal"
        prominent
        class="mb-4"
        :text="warningMessage"
      ></v-alert>

      <p class="mb-4">{{ confirmText }}</p>

      <v-text-field
        v-model="confirmationInput"
        :placeholder="placeholder"
        variant="outlined"
        density="comfortable"
        :error="hasError"
        :error-messages="errorMessage"
        @input="clearError"
      ></v-text-field>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        :text="$t('common.cancel')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        variant="flat"
        :text="$t('common.delete')"
        @click="handleConfirm"
        :loading="isLoading"
        :disabled="!confirmationInput.trim()"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

useI18n()

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  entityName: {
    type: String,
    default: '',
  },
  warningMessage: {
    type: String,
    required: true,
  },
  confirmText: {
    type: String,
    required: true,
  },
  placeholder: {
    type: String,
    required: true,
  },
  expectedInput: {
    type: String,
    required: true,
  },
  invalidInputMessage: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'confirm'])

const confirmationInput = ref('')
const hasError = ref(false)
const errorMessage = ref('')

const clearError = () => {
  hasError.value = false
  errorMessage.value = ''
}

const handleConfirm = () => {
  if (confirmationInput.value.trim() !== props.expectedInput) {
    hasError.value = true
    errorMessage.value = props.invalidInputMessage
    return
  }

  emit('confirm')
}
</script>

<style lang="scss" scoped></style>
