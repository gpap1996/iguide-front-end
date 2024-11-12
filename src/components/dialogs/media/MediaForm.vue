<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ media ? 'Edit Media' : 'Upload Media' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-select
        v-model="language"
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

        <v-file-input
          class="mt-4"
          v-model="form.file"
          label="Upload File"
          variant="outlined"
          density="comfortable"
        ></v-file-input>
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
      <v-btn color="primary" text="Save" variant="flat" @click="onSubmitMedia"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

const { media } = defineProps({ media: Object })
const emits = defineEmits(['close', 'reset'])
const language = ref('el') // Set default language to Greek
const languages = [
  { name: 'Ελληνικά', locale: 'el' },
  { name: 'Αγγλικά', locale: 'en' },
]

const form = ref({
  type: null,
  file: [],
  translations: {
    el: { title: '', description: '' },
    en: { title: '', description: '' },
  },
})

const fileTypes = ['image', 'audio', 'video', 'tiles']

onMounted(() => {
  if (media) {
    form.value.type = media.type
    // Populate translations from the media data
    form.value.translations.el.title = media.title?.el || ''
    form.value.translations.en.title = media.title?.en || ''
    form.value.translations.el.description = media.description?.el || ''
    form.value.translations.en.description = media.description?.en || ''
  }
})

// Computed properties to dynamically get/set title and description based on selected language
const currentTitle = computed({
  get: () => form.value.translations[language.value].title,
  set: (value) => (form.value.translations[language.value].title = value),
})

const currentDescription = computed({
  get: () => form.value.translations[language.value].description,
  set: (value) => (form.value.translations[language.value].description = value),
})

const onSubmitMedia = async () => {
  const formData = new FormData()
  formData.append('files', form.value.file)

  // Convert translations to an array structure for the API payload
  const translationsArray = Object.keys(form.value.translations).map((lang) => ({
    locale: lang,
    title: form.value.translations[lang].title,
    description: form.value.translations[lang].description,
  }))

  formData.append(
    'metadata',
    JSON.stringify([
      {
        type: form.value.type,
        translations: translationsArray,
        fileIndex: 0,
      },
    ]),
  )

  try {
    await axios.post('/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    emits('reset')
  } catch (error) {
    console.error('Error uploading media:', error)
  }
}
</script>

<style lang="scss" scoped></style>
