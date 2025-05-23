<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">Mass Upload Files</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <!-- File Type Selection -->
      <v-select
        v-model="selectedFileType"
        label="File Type"
        :items="fileTypes"
        variant="outlined"
        density="comfortable"
        class="mb-6"
        :rules="[(v) => !!v || 'File type is required']"
        required
        hint="Select the type of files you want to upload"
        persistent-hint
      ></v-select>

      <!-- Drop Zone -->
      <div v-if="selectedFileType" class="mb-6">
        <div
          @click="triggerFileInput"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragenter="handleDragEnter"
          @dragleave="handleDragLeave"
          :class="[
            'drop-zone',
            {
              'drag-over': isDragOver,
              'has-files': files.length > 0,
            },
          ]"
        >
          <div class="drop-zone-content">
            <v-icon size="64" color="primary" class="mb-4">
              {{ getFileTypeIcon(selectedFileType) }}
            </v-icon>
            <div class="text-h6 mb-2">
              {{ files.length > 0 ? `${files.length} file(s) selected` : 'Drop your files here' }}
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              or click to browse {{ selectedFileType }} files
            </div>
            <v-chip
              v-if="selectedFileType"
              color="primary"
              variant="tonal"
              size="small"
              class="mb-2"
            >
              Accepted: {{ getAcceptedFormats(selectedFileType) }}
            </v-chip>
          </div>

          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            multiple
            :accept="getFileInputAccept(selectedFileType)"
            @change="handleFileInputChange"
            style="display: none"
          />
        </div>

        <!-- File List -->
        <div v-if="files.length > 0" class="mt-4">
          <div class="d-flex justify-space-between align-center mb-2">
            <div class="text-subtitle-1">Selected Files</div>
            <v-btn
              size="small"
              color="error"
              variant="text"
              prepend-icon="mdi-delete-sweep"
              @click="clearFiles"
            >
              Clear All
            </v-btn>
          </div>
          <v-card variant="outlined">
            <v-card-text>
              <div v-for="(file, index) in files" :key="index" class="file-item">
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" color="primary">
                      {{ getFileIcon(file) }}
                    </v-icon>
                    <div>
                      <div class="font-weight-medium">{{ file.name }}</div>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatFileSize(file.size) }}
                      </div>
                    </div>
                  </div>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="removeFile(index)"
                    color="error"
                  ></v-btn>
                </div>
                <v-divider v-if="index < files.length - 1" class="my-2"></v-divider>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Validation Errors -->
        <v-alert v-if="validationErrors.length > 0" type="error" variant="tonal" class="mt-4">
          <div class="text-subtitle-2 mb-2">File Validation Errors:</div>
          <ul>
            <li v-for="error in validationErrors" :key="error">{{ error }}</li>
          </ul>
        </v-alert>
      </div>
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
        text="Upload Files"
        variant="flat"
        @click="uploadFiles"
        :loading="isLoading"
        :disabled="!canUpload"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import axios from 'axios'
import { ref, computed, watch } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const emits = defineEmits(['close', 'reset'])
const { snackbar } = storeToRefs(useBaseStore())

// Component state
const files = ref([])
const selectedFileType = ref(null)
const fileInput = ref(null)
const isLoading = ref(false)
const isDragOver = ref(false)
const validationErrors = ref([])

// File types definition
const fileTypes = ['image', 'audio']

// Helper functions for file type validation and icons
const getFileTypeIcon = (type) => {
  switch (type) {
    case 'image':
      return 'mdi-image-multiple'
    case 'audio':
      return 'mdi-music'
    default:
      return 'mdi-file-multiple'
  }
}

const getFileIcon = (file) => {
  const type = file.type.split('/')[0]
  switch (type) {
    case 'image':
      return 'mdi-image'
    case 'audio':
      return 'mdi-music-note'
    default:
      return 'mdi-file'
  }
}

const getAcceptedFormats = (type) => {
  switch (type) {
    case 'image':
      return '.jpg, .jpeg, .png, .gif, .webp'
    case 'audio':
      return '.mp3, .wav, .ogg, .m4a'
    default:
      return ''
  }
}

const getFileInputAccept = (type) => {
  switch (type) {
    case 'image':
      return 'image/*'
    case 'audio':
      return 'audio/*'
    default:
      return ''
  }
}

// Format file size helper
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// File input events
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileInputChange = (event) => {
  validateAndAddFiles(Array.from(event.target.files || []))
  // Reset file input so the same file can be selected again
  event.target.value = ''
}

// Drag and drop events
const handleDragOver = (e) => {
  e.preventDefault()
}

const handleDragEnter = (e) => {
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  isDragOver.value = false
}

const handleDrop = (e) => {
  e.preventDefault()
  isDragOver.value = false

  if (e.dataTransfer?.files) {
    validateAndAddFiles(Array.from(e.dataTransfer.files))
  }
}

// File validation
const validateAndAddFiles = (newFiles) => {
  validationErrors.value = []

  // Check if file type is selected
  if (!selectedFileType.value) {
    validationErrors.value.push('Please select a file type first')
    return
  }

  const validFiles = []

  newFiles.forEach((file) => {
    // Validate file type
    const isValid = validateFileType(file, selectedFileType.value)

    if (isValid) {
      // Check for duplicates
      const isDuplicate = isDuplicateFile(file)
      if (!isDuplicate) {
        validFiles.push(file)
      } else {
        validationErrors.value.push(`"${file.name}" is a duplicate file`)
      }
    } else {
      validationErrors.value.push(`"${file.name}" is not a valid ${selectedFileType.value} file`)
    }
  })

  // Add valid files to the list
  if (validFiles.length > 0) {
    files.value = [...files.value, ...validFiles]
  }
}

const validateFileType = (file, type) => {
  if (type === 'image' && file.type.startsWith('image/')) return true
  if (type === 'audio' && file.type.startsWith('audio/')) return true
  return false
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const clearFiles = () => {
  files.value = []
  validationErrors.value = []
}

// Check if file already exists in the files array
const isDuplicateFile = (newFile) => {
  return files.value.some(
    (existingFile) =>
      existingFile.name === newFile.name &&
      existingFile.size === newFile.size &&
      existingFile.type === newFile.type,
  )
}

const canUpload = computed(() => {
  return selectedFileType.value && files.value.length > 0 && validationErrors.value.length === 0
})

const uploadFiles = async () => {
  if (!canUpload.value) return

  isLoading.value = true
  const formData = new FormData()

  // Append files
  Array.from(files.value).forEach((file) => {
    formData.append('files', file)
  })

  // Add simple file type to the form data
  formData.append('type', selectedFileType.value)

  try {
    await axios.post('/files/mass-upload', formData, {
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
    emits('reset')
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
  selectedFileType.value = null
  validationErrors.value = []
}

// Watch for changes in selectedFileType and reset files when it changes
watch(selectedFileType, () => {
  if (files.value.length > 0) {
    files.value = []
    validationErrors.value = []
  }
})
</script>

<style scoped>
.drop-zone {
  border: 2px dashed rgba(var(--v-theme-primary), 0.4);
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: rgba(var(--v-theme-primary), 0.8);
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.has-files {
  border-color: rgba(var(--v-theme-success), 0.5);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.file-item {
  padding: 0.75rem 0;
}
</style>
