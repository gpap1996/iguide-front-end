<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">Upload Media</div>
      <v-spacer></v-spacer>
      <v-icon @click="$emit('close')" style="cursor: pointer">mdi-close</v-icon>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form>
        <v-row>
          <v-col cols="6">
            <v-text-field
              v-model="form.title"
              density="comfortable"
              variant="outlined"
              label="Title"
            ></v-text-field>
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="form.type"
              label="Type"
              :items="fileTypes"
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>

          <v-col cols="6">
            <VuetifyTiptap
              v-model="form.description"
              minHeight="250"
              maxHeight="250"
              markdown-theme="github"
            />
          </v-col>

          <v-col cols="6">
            <v-file-input
              v-model="form.file"
              label="Upload File"
              variant="outlined"
              density="comfortable"
            ></v-file-input>
          </v-col>
        </v-row>
      </v-form>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" text="Close" @click="$emit('close')" class="mr-2"></v-btn>
      <v-btn color="primary" text="Save" variant="flat" @click="onSubmitMedia"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { useBaseStore } from '@/stores/base'
import axios from 'axios'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'

const emits = defineEmits(['close'])

const form = ref({
  title: null,
  type: null,
  file: [],
  description: null,
})
const fileTypes = ['image', 'audio', 'video', 'other']
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
