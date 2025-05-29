<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? $t('files.edit') : $t('files.upload') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="formValid">
        <!-- Type selection - first field -->
        <v-select
          v-model="form.type"
          :label="$t('files.type')"
          :items="fileTypes"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || $t('validation.required')]"
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
            :label="form.type === 'audio' ? $t('files.languageSingle') : $t('files.language')"
            class="mb-4"
            :hint="
              form.type === 'audio' ? $t('files.languageSingleHint') : $t('files.languageHint')
            "
            :disabled="form.type === 'audio' && isEdit"
            @update:model-value="form.type === 'audio' ? resetForm('language') : null"
            persistent-hint
          ></v-select>

          <v-text-field
            v-model="currentTitle"
            density="comfortable"
            variant="outlined"
            :label="$t('files.fileTitle')"
          ></v-text-field>

          <VuetifyTiptap
            :label="$t('files.description')"
            v-model="currentDescription"
            minHeight="250"
            maxHeight="250"
            markdown-theme="github"
          />

          <div class="d-flex flex-column align-center my-4">
            <v-file-input
              v-model="form.file"
              :label="isEdit ? $t('files.replace') : $t('files.uploadFile')"
              variant="outlined"
              density="comfortable"
              :accept="getFileInputAccept(form.type)"
              @update:model-value="handleFileChange"
              width="100%"
              :hint="
                $t('files.maxSize', { size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE) }) +
                ' | ' +
                $t('files.allowedTypes', { types: getAllowedTypesText(form.type) })
              "
              persistent-hint
              :rules="[
                (v) => {
                  if (!isEdit && !v) {
                    return $t('validation.fileRequired')
                  }
                  return true
                },
                (v) => {
                  if (v && typeof v === 'object' && v.size !== undefined) {
                    return validateFileSize(v)
                      ? true
                      : $t('validation.fileSize', {
                          size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE),
                        })
                  }
                  return true
                },
                (v) => {
                  if (v && typeof v === 'object' && v.type !== undefined && form.type) {
                    return validateFileType(v, form.type)
                      ? true
                      : $t('validation.fileType', {
                          type: form.type,
                          types: getAllowedTypesText(form.type),
                        })
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
                :alt="$t('files.currentFile')"
                width="250"
                height="250"
                cover
                :lazy-src="file?.thumbnailUrl"
              />

              <audio controls v-if="file?.type === 'audio'">
                <source :src="`${file?.url}`" type="audio/mp3" />
                {{ $t('files.audioNotSupported') }}
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
        :text="$t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        :text="$t('common.save')"
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const baseStore = useBaseStore()
const { languages, snackbar } = storeToRefs(baseStore)

// File limits from backend
const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB per batch
  MAX_FILES_PER_BATCH: 50,
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/tiff',
    'image/bmp',
    'image/ico',
    'image/heic',
  ],
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
      return '.jpg, .jpeg, .png, .gif, .webp, .svg, .tiff, .bmp, .ico, .heic'
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
  errorMessage.value = ''

  if (file) {
    if (!validateFileSize(file)) {
      errorMessage.value = t('validation.fileSize', {
        size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE),
      })
      snackbar.value = {
        show: true,
        text: errorMessage.value,
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    if (!validateFileType(file, form.value.type)) {
      errorMessage.value = t('validation.fileType', {
        type: form.value.type,
        types: getAllowedTypesText(form.value.type),
      })
      snackbar.value = {
        show: true,
        text: errorMessage.value,
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    errorMessage.value = ''
  }
}

// Form submission handler
const onSubmitFile = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true

    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: t('validation.required'),
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }
    }

    if (!form.value.type) {
      isLoading.value = false
      snackbar.value = {
        show: true,
        text: t('validation.required'),
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    if (!isEdit.value && !form.value.file) {
      isLoading.value = false
      snackbar.value = {
        show: true,
        text: t('validation.fileRequired'),
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      return
    }

    if (form.value.file) {
      if (!validateFileSize(form.value.file)) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: t('validation.fileSize', { size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE) }),
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }

      if (!validateFileType(form.value.file, form.value.type)) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: t('validation.fileType', {
            type: form.value.type,
            types: getAllowedTypesText(form.value.type),
          }),
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
      text: isEdit.value ? t('files.editSuccess') : t('files.uploadSuccess'),
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
