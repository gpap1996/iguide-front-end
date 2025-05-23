<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? 'Edit File' : 'Upload File' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-select
        v-model="selectedLanguageLocale"
        :items="languages"
        item-title="name"
        item-value="locale"
        variant="outlined"
        density="comfortable"
        label="Language"
      ></v-select>

      <v-form ref="formRef" v-model="formValid">
        <v-text-field
          v-model="currentTitle"
          density="comfortable"
          variant="outlined"
          label="Title"
        ></v-text-field>
        <v-select
          v-model="form.type"
          label="Type"
          :items="fileTypes"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || 'File type is required']"
          required
        ></v-select>

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
            accept="image/*,video/*,audio/*,.mbtiles,application/x-mbtiles"
            @update:model-value="handleFileChange"
            width="100%"
            :rules="[(v) => !!v || isEdit || 'File is required']"
            :required="!isEdit"
          ></v-file-input>

          <div v-if="isEdit && file?.url" class="align-self-start">
            <img
              v-if="file?.type === 'image'"
              :src="`http://localhost:3000${file.url}`"
              alt="Current file"
              width="250"
              height="250"
              style="object-fit: cover"
            />
            <audio controls v-if="file?.type === 'audio'">
              <source :src="`http://localhost:3000${file.url}`" type="audio/ogg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
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
        :disabled="isLoading"
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
const errorMessage = ref('')
const formRef = ref(null)
const formValid = ref(false)

const selectedLanguageLocale = ref(languages.value[0]?.locale)

const isEdit = computed(() => !!props.file)

// Form data
const form = ref({
  type: null,
  file: null,
  translations: {},
})

const fileTypes = ['image', 'audio', 'video', 'tiles']

onMounted(() => {
  // Initialize translations
  languages.value.forEach((lang) => {
    form.value.translations[lang.locale] = { title: '', description: '' }
  })

  if (props.file) {
    form.value.type = props.file.type

    // Populate translations if they exist
    if (props.file.translations) {
      props.file.translations.forEach((translation) => {
        form.value.translations[translation.language.locale] = {
          title: translation.title || '',
          description: translation.description || '',
        }
      })
    }
  }
})

// Computed properties for current translation fields
const currentTitle = computed({
  get: () => form.value.translations[selectedLanguageLocale.value]?.title || '',
  set: (value) => {
    if (!form.value.translations[selectedLanguageLocale.value]) {
      form.value.translations[selectedLanguageLocale.value] = {}
    }
    form.value.translations[selectedLanguageLocale.value].title = value
  },
})

const currentDescription = computed({
  get: () => form.value.translations[selectedLanguageLocale.value]?.description || '',
  set: (value) => {
    if (!form.value.translations[selectedLanguageLocale.value]) {
      form.value.translations[selectedLanguageLocale.value] = {}
    }
    form.value.translations[selectedLanguageLocale.value].description = value
  },
})

// File change handler
const handleFileChange = (file) => {
  if (file) {
    const validTypes = ['image/', 'video/', 'audio/']
    const isValidType = validTypes.some((type) => file.type.startsWith(type))

    if (!isValidType) {
      form.value.file = null
      errorMessage.value = 'Invalid file type. Please upload an image, video, or audio file.'
    } else {
      errorMessage.value = ''
    }
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

    const formData = new FormData()

    // Only append file if it exists
    if (form.value.file) {
      formData.append('file', form.value.file)
    }

    if (form.value.type) {
      formData.append('type', form.value.type)
    }

    // Filter out empty translations
    const filteredTranslations = Object.fromEntries(
      Object.entries(form.value.translations).filter(
        ([, translation]) =>
          translation.title.trim() !== '' || translation.description.trim() !== '',
      ),
    )

    // Prepare metadata
    const metadata = {
      translations: filteredTranslations,
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
      text: 'File uploaded successfully!',
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `Error handling file ${error}`,
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
