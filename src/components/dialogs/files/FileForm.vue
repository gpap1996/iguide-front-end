<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? 'Edit File' : 'Upload File' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="formValid">
        <!-- Type selection - first field -->
        <v-select
          v-model="form.type"
          label="Type"
          :items="fileTypes"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || 'File type is required']"
          required
          class="mb-4"
          @update:model-value="resetForm('type')"
          :disabled="isEdit"
        ></v-select>

        <!-- Show rest of form only when type is selected -->
        <template v-if="form.type">
          <!-- Language selection -->
          <v-select
            v-model="selectedLanguageLocale"
            :items="languages"
            item-title="name"
            item-value="locale"
            variant="outlined"
            density="comfortable"
            :label="form.type === 'audio' ? 'Language (single language only)' : 'Language'"
            class="mb-4"
            :hint="
              form.type === 'audio'
                ? 'Audio files support only one language translation'
                : 'You can add translations for multiple languages'
            "
            :disabled="form.type === 'audio' && isEdit"
            @update:model-value="form.type === 'audio' ? resetForm('language') : null"
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

          <div class="d-flex flex-column align-center my-4">
            <v-file-input
              v-model="form.file"
              :label="isEdit ? 'Replace File' : 'Upload File'"
              variant="outlined"
              density="comfortable"
              :accept="getFileInputAccept(form.type)"
              @update:model-value="handleFileChange"
              width="100%"
              :hint="`Max size: ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)} | Allowed types: ${getAllowedTypesText(form.type)}`"
              persistent-hint
              :rules="[
                (v) => {
                  // File is required for new uploads
                  if (!isEdit && !v) {
                    return 'File is required'
                  }
                  return true
                },
                (v) => {
                  // Validate file size if file exists and has size property
                  if (v && typeof v === 'object' && v.size !== undefined) {
                    return validateFileSize(v)
                      ? true
                      : `File size must be less than ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)}`
                  }
                  return true
                },
                (v) => {
                  // Validate file type if file exists and has type property
                  if (v && typeof v === 'object' && v.type !== undefined && form.type) {
                    return validateFileType(v, form.type)
                      ? true
                      : `Invalid file type for ${form.type}. Allowed types: ${getAllowedTypesText(form.type)}`
                  }
                  return true
                },
              ]"
              :required="!isEdit"
            ></v-file-input>

            <div v-if="isEdit && file?.path" class="align-self-start mt-4">
              <v-img
                v-if="file?.type === 'image'"
                :src="`${file?.url}`"
                alt="Current file"
                width="250"
                height="250"
                cover
                :lazy-src="file?.thumbnailUrl"
              />
              <audio controls v-if="file?.type === 'audio'">
                <source :src="`${file?.url}`" type="audio/mp3" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </template>
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

// File limits from backend
const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB per batch
  MAX_FILES_PER_BATCH: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mp3'],
}

const props = defineProps({
  file: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['close', 'reset'])

// Component state
const isLoading = ref(false)
const errorMessage = ref('')
const formRef = ref(null)
const formValid = ref(false)
const selectedLanguageLocale = ref(languages.value[0]?.locale)

const isEdit = computed(() => !!props.file)

// Check if form can be submitted
const canSubmit = computed(() => {
  // Check if file type is selected
  if (!form.value.type) return false

  // Check if file is provided for new uploads
  if (!isEdit.value && !form.value.file) return false

  // Check file validation if file exists
  if (form.value.file) {
    if (!validateFileSize(form.value.file)) return false
    if (!validateFileType(form.value.file, form.value.type)) return false
  }

  return true
})

// Form data
const form = ref({
  type: null,
  file: null,
  translations: {},
})

const fileTypes = ['image', 'audio']

const resetForm = (changedField = null) => {
  if (changedField === 'type') {
    form.value.translations = {}
    form.value.file = null
  } else if (changedField === 'language') {
    form.value.translations = {}
  }
}

// Helper functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const getFileInputAccept = (type) => {
  switch (type) {
    case 'image':
      return FILE_LIMITS.ALLOWED_IMAGE_TYPES.join(',')
    case 'audio':
      return FILE_LIMITS.ALLOWED_AUDIO_TYPES.join(',')
    default:
      return FILE_LIMITS.ALLOWED_IMAGE_TYPES.concat(FILE_LIMITS.ALLOWED_AUDIO_TYPES).join(',')
  }
}

const getAllowedTypesText = (type) => {
  switch (type) {
    case 'image':
      return '.jpg, .jpeg, .png, .gif, .webp'
    case 'audio':
      return '.mp3'
    default:
      return ''
  }
}

const validateFileSize = (file) => {
  if (!file) return true
  return file.size <= FILE_LIMITS.MAX_FILE_SIZE
}

const validateFileType = (file, type) => {
  if (!file || !type) return true

  let isMp3MimeType, isMp3Extension

  switch (type) {
    case 'image':
      return FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)
    case 'audio':
      // Check both MIME type and file extension for audio files
      isMp3MimeType = file.type === 'audio/mp3' || file.type === 'audio/mpeg'
      isMp3Extension = file.name.toLowerCase().endsWith('.mp3')
      return isMp3MimeType || isMp3Extension
    default:
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

// File change handler
const handleFileChange = (file) => {
  // Clear any previous error messages
  errorMessage.value = ''

  if (file) {
    // Validate file size
    if (!validateFileSize(file)) {
      // Don't set form.value.file = null here, let the validation rules handle it
      errorMessage.value = `File size exceeds maximum limit of ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)}`
      snackbar.value = {
        show: true,
        text: errorMessage.value,
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    // Validate file type
    if (!validateFileType(file, form.value.type)) {
      // Don't set form.value.file = null here, let the validation rules handle it
      errorMessage.value = `Invalid file type for ${form.value.type}. Allowed types: ${getAllowedTypesText(form.value.type)}`
      snackbar.value = {
        show: true,
        text: errorMessage.value,
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    // If we reach here, the file is valid
    errorMessage.value = ''
  }
}

// Form submission handler
const onSubmitFile = async () => {
  try {
    errorMessage.value = ''
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

    // Validate file type is selected
    if (!form.value.type) {
      isLoading.value = false
      snackbar.value = {
        show: true,
        text: 'Please select a file type',
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    // Validate file is uploaded (only if not in edit mode)
    if (!isEdit.value && !form.value.file) {
      isLoading.value = false
      snackbar.value = {
        show: true,
        text: 'Please upload a file',
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    // Additional file validation before submission
    if (form.value.file) {
      // Check file size
      if (!validateFileSize(form.value.file)) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: `File size exceeds maximum limit of ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)}`,
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }

      // Check file type
      if (!validateFileType(form.value.file, form.value.type)) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: `Invalid file type for ${form.value.type}. Allowed types: ${getAllowedTypesText(form.value.type)}`,
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }
    }

    const formData = new FormData()

    // Only append file if it exists
    if (form.value.file) {
      formData.append('file', form.value.file)
    }

    if (form.value.type) {
      formData.append('type', form.value.type)
    }

    // Handle translations based on file type
    let translationsToSubmit = {}

    if (form.value.type === 'audio') {
      // For audio files, only submit the current language translation
      const currentTranslation = form.value.translations[selectedLanguageLocale.value]
      if (currentTranslation && (currentTranslation.title || currentTranslation.description)) {
        translationsToSubmit[selectedLanguageLocale.value] = currentTranslation
      }
    } else {
      // For images, submit all non-empty translations
      translationsToSubmit = Object.fromEntries(
        Object.entries(form.value.translations).filter(
          ([, translation]) =>
            translation.title.trim() !== '' || translation.description.trim() !== '',
        ),
      )
    }

    // Prepare metadata
    const metadata = {
      translations: translationsToSubmit,
    }

    formData.append('metadata', JSON.stringify(metadata))

    if (isEdit.value) {
      await axios.put(`/files/${props.file.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await axios.post('/files', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    emit('reset')
    emit('close')
    snackbar.value = {
      show: true,
      text: `${isEdit.value ? 'File updated successfully!' : 'File uploaded successfully!'}`,
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

    console.error('Error handling file:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
