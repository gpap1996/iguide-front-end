<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? 'Edit External File' : 'Add External File' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="formValid">
        <!-- Type selection -->
        <v-select
          v-model="form.type"
          label="Type"
          :items="fileTypes"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || 'File type is required']"
          required
          class="mb-4"
        ></v-select>

        <!-- URL input -->
        <v-text-field
          v-model="form.url"
          label="URL"
          variant="outlined"
          density="comfortable"
          :rules="[
            (v) => !!v || 'URL is required',
            (v) => validateUrl(v) || 'Please enter a valid URL',
          ]"
          required
          class="mb-4"
        ></v-text-field>

        <!-- Language selection -->
        <v-select
          v-model="selectedLanguageLocale"
          :items="languages"
          item-title="name"
          item-value="locale"
          variant="outlined"
          density="comfortable"
          label="Language"
          class="mb-4"
          hint="You can add translations for multiple languages"
          persistent-hint
        ></v-select>

        <v-text-field
          v-model="currentTitle"
          density="comfortable"
          variant="outlined"
          label="Title"
        ></v-text-field>

        <VuetifyTiptap
          label="Description"
          v-model="currentDescription"
          minHeight="250"
          maxHeight="250"
          markdown-theme="github"
        />
      </v-form>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        text="Close"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        text="Save"
        variant="flat"
        @click="onSubmitFile"
        :loading="isLoading"
        :disabled="isLoading || !canSubmit"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const baseStore = useBaseStore()
const { languages, snackbar } = storeToRefs(baseStore)

const props = defineProps({
  file: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['close', 'reset'])

// Component state
const isLoading = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const selectedLanguageLocale = ref(languages.value[0]?.locale)

const isEdit = computed(() => !!props.file)

// Check if form can be submitted
const canSubmit = computed(() => {
  return form.value.type && form.value.url
})

// Form data
const form = ref({
  type: null,
  url: '',
  translations: {},
})

const fileTypes = ['video', 'model']

// URL validation function
const validateUrl = (url) => {
  if (!url) return true // Let the required rule handle empty values

  try {
    // More permissive URL validation pattern
    const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
    return urlPattern.test(url)
  } catch {
    return false
  }
}

// Computed properties for current translation fields
const currentTitle = computed({
  get: () => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    return translations[locale]?.title || ''
  },
  set: (value) => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    if (!translations[locale]) {
      translations[locale] = { title: '', description: '' }
    }
    translations[locale].title = value
  },
})

const currentDescription = computed({
  get: () => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    return translations[locale]?.description || ''
  },
  set: (value) => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    if (!translations[locale]) {
      translations[locale] = { title: '', description: '' }
    }
    translations[locale].description = value
  },
})

onMounted(() => {
  if (props.file) {
    form.value.type = props.file.type
    form.value.url = props.file.url

    // Initialize translations object
    const newTranslations = {}

    // Populate translations if they exist
    if (props.file.translations && props.file.translations.length > 0) {
      // Populate with actual data
      props.file.translations.forEach((translation) => {
        const locale = translation.language.locale
        newTranslations[locale] = {
          title: translation.title,
          description: translation.description,
        }
      })

      // Set translations
      form.value.translations = newTranslations

      // Set selected language to the first translation's language
      selectedLanguageLocale.value = props.file.translations[0].language.locale
    } else {
      // No translations exist, initialize all languages with empty values
      languages.value.forEach((lang) => {
        newTranslations[lang.locale] = { title: '', description: '' }
      })
      form.value.translations = newTranslations
    }
  } else {
    // New file mode - initialize translations with empty values
    const newTranslations = {}
    languages.value.forEach((lang) => {
      newTranslations[lang.locale] = { title: '', description: '' }
    })
    form.value.translations = newTranslations
  }
})

// Form submission handler
const onSubmitFile = async () => {
  try {
    isLoading.value = true

    // Validate form
    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: 'Please fill in all required fields',
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }
    }

    const payload = {
      type: form.value.type,
      url: form.value.url,
      translations: form.value.translations,
    }

    if (isEdit.value) {
      await axios.put(`/external-files/${props.file.id}`, payload)
    } else {
      await axios.post('/external-files', payload)
    }

    emit('reset')
    emit('close')
    snackbar.value = {
      show: true,
      text: `${isEdit.value ? 'External file updated successfully!' : 'External file added successfully!'}`,
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error.response?.data?.error + '. ' + error.response?.data?.details}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }

    console.error('Error handling external file:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
