<template>
  <v-card class="component-wrapper d-flex flex-column">
    <v-form @submit.prevent="onSubmit">
      <v-file-input
        multiple
        v-model="files"
        class="flex-grow-0 mb-4"
        label="Upload Files"
        style="width: 500px"
        @update:model-value="handleFileChange"
      ></v-file-input>

      <!-- File Metadata Section -->
      <v-card v-if="files.length > 0" class="mb-4" style="max-width: 800px">
        <v-card-title>File Details</v-card-title>
        <v-card-text>
          <div v-for="(file, index) in files" :key="index" class="mb-6">
            <v-divider v-if="index > 0" class="mb-4"></v-divider>

            <div class="text-subtitle-1 mb-2">File {{ index + 1 }}: {{ file.name }}</div>

            <v-text-field
              v-model="fileMetadata[index].title"
              label="Title (Optional)"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              hint="Leave empty to use filename"
              persistent-hint
            ></v-text-field>

            <v-select
              v-model="fileMetadata[index].type"
              label="Type"
              :items="fileTypes"
              variant="outlined"
              density="comfortable"
              class="mb-2"
              :rules="[(v) => !!v || 'Type is required']"
            ></v-select>

            <v-textarea
              v-model="fileMetadata[index].description"
              label="Description (Optional)"
              variant="outlined"
              density="comfortable"
              rows="2"
              hint="Optional description for the file"
              persistent-hint
            ></v-textarea>
          </div>
        </v-card-text>
      </v-card>

      <div class="d-flex gap-2">
        <v-btn color="primary" type="submit" :loading="isLoading" :disabled="!isValid">
          Upload Files
        </v-btn>

        <v-btn color="error" variant="outlined" @click="resetForm" :disabled="isLoading">
          Reset
        </v-btn>
      </div>
    </v-form>
  </v-card>
</template>

<script setup>
import axios from 'axios'
import { ref, computed } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const { snackbar } = storeToRefs(useBaseStore())
const files = ref([])
const fileMetadata = ref([])
const isLoading = ref(false)

// Predefined file types - customize as needed
const fileTypes = ['image', 'audio', 'video', 'other']

// Handle file selection
const handleFileChange = (newFiles) => {
  // Initialize or update metadata array for each file
  fileMetadata.value = newFiles.map((file, index) => ({
    title: '', // Empty by default, will use filename if not provided
    type: '', // Empty by default
    description: '', // Empty by default
    fileIndex: index,
  }))
}

// Validation - only type is required now
const isValid = computed(() => {
  if (!files.value.length) return false

  return fileMetadata.value.every((meta) => meta.type?.trim())
})

// Form submission
const onSubmit = async () => {
  if (!isValid.value) return

  isLoading.value = true
  const formData = new FormData()

  // Append files
  Array.from(files.value).forEach((file) => {
    formData.append('files', file)
  })

  // Clean up metadata before sending
  const cleanMetadata = fileMetadata.value.map((meta) => ({
    ...meta,
    // Only include title and description if they're not empty
    ...(meta.title?.trim() && { title: meta.title.trim() }),
    ...(meta.description?.trim() && { description: meta.description.trim() }),
    type: meta.type,
  }))

  // Append metadata
  formData.append('metadata', JSON.stringify(cleanMetadata))

  try {
    await axios.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    snackbar.value = {
      show: true,
      text: 'Files uploaded successfully!',
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }

    resetForm()
  } catch (error) {
    console.error('Upload error:', error)
    snackbar.value = {
      show: true,
      text: 'Error uploading files. Please try again.',
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isLoading.value = false
  }
}

// Reset form
const resetForm = () => {
  files.value = []
  fileMetadata.value = []
}
</script>

<style scoped>
.component-wrapper {
  padding: 16px;
}
</style>
