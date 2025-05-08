<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? 'Edit Media' : 'Upload Media' }}</div>
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

      <v-form>
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
          ></v-file-input>

          <div v-if="isEdit && media?.url" class="current-media ml-4">
            <img
              :src="`http://localhost:3000${media.url}`"
              alt="Current media"
              class="rounded"
              width="100"
              height="100"
              style="object-fit: cover"
            />
          </div>
        </div>

        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mt-4">
          {{ errorMessage }}
        </v-alert>
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
        @click="onSubmitMedia"
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

const props = defineProps({
  media: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['close', 'reset'])

// Component state
const isLoading = ref(false)
const errorMessage = ref('')

const { languages } = storeToRefs(useBaseStore())

const selectedLanguageLocale = ref(languages.value[0]?.locale)

const isEdit = computed(() => !!props.media)

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

  if (props.media) {
    form.value.type = props.media.type

    // Populate translations if they exist
    if (props.media.translations) {
      console.log(props.media.translations)
      props.media.translations.forEach((translation) => {
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
const onSubmitMedia = async () => {
  try {
    errorMessage.value = ''
    isLoading.value = true

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
      await axios.put(`/media/${props.media.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    } else {
      await axios.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    emit('reset')
    emit('close')
  } catch (error) {
    console.error('Error handling media:', error)
    errorMessage.value = error.response?.data?.error || 'An error occurred while saving the media'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
