<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ media ? 'Edit Media' : 'Upload Media' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form>
        <v-text-field
          v-model="form.title"
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
          v-model="form.description"
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
import { useBaseStore } from '@/stores/base'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

onMounted(() => {
  if (media) {
    form.value.title = media.title
    form.value.type = media.type
    form.value.description = media.description
  }
})

const emits = defineEmits(['close'])
const { media } = defineProps({
  media: Object,
})

const form = ref({
  title: null,
  type: null,
  file: [],
  description: null,
})
const fileTypes = ['image', 'audio', 'video', 'tiles']
const { snackbar } = storeToRefs(useBaseStore())

const onSubmitMedia = async () => {
  const formData = new FormData()

  formData.append('files', form.value.file)
  formData.append(
    'metadata',
    JSON.stringify([
      {
        title: form.value.title,
        type: form.value.type,
        description: form.value.description,
        fileIndex: 0,
      },
    ]),
  )

  try {
    await axios.post('/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    snackbar.value = {
      show: true,
      text: 'File uploaded successfully!',
      color: 'success',
    }

    emits('close')
    emits('reset')
  } catch (e) {
    console.error(e)
    snackbar.value = {
      show: true,
      text: 'Error uploading files. Please try again.',
      color: 'error',
    }
  }
}
</script>

<style lang="scss" scoped></style>
