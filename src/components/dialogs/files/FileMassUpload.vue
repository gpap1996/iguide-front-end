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
        :disabled="isLoading"
      ></v-select>

      <!-- File Limits Info -->
      <v-alert v-if="selectedFileType" type="info" variant="tonal" class="mb-4">
        <div class="text-subtitle-2 mb-2">Upload Limits:</div>
        <ul class="text-body-2">
          <li>Maximum file size: {{ formatFileSize(FILE_LIMITS.MAX_FILE_SIZE) }}</li>
          <li>Maximum total size: {{ formatFileSize(FILE_LIMITS.MAX_TOTAL_SIZE) }}</li>
          <li>Maximum files per batch: {{ FILE_LIMITS.MAX_FILES_PER_BATCH }}</li>
          <li>Current total size: {{ formatFileSize(totalFileSize) }}</li>
        </ul>
      </v-alert>

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
              disabled: isLoading,
            },
          ]"
        >
          <div class="drop-zone-content">
            <v-icon size="64" color="primary" class="mb-4">
              {{ getFileTypeIcon(selectedFileType) }}
            </v-icon>
            <div class="text-h6 mb-2">
              <template v-if="isLoading">Processing files...</template>
              <template v-else>{{
                files.length > 0 ? `${files.length} file(s) selected` : 'Drop your files here'
              }}</template>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              <template v-if="!isLoading">or click to browse {{ selectedFileType }} files</template>
            </div>
            <v-chip
              v-if="selectedFileType && !isLoading"
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
            <div class="text-subtitle-1">
              Selected Files ({{ files.filter((f) => f.isValid !== false).length }} valid,
              {{ files.length }} total / {{ FILE_LIMITS.MAX_FILES_PER_BATCH }} max)
            </div>
            <v-btn
              size="small"
              color="error"
              variant="text"
              prepend-icon="mdi-delete-sweep"
              @click="clearFiles"
              :disabled="isLoading"
            >
              Clear All
            </v-btn>
          </div>
          <v-card variant="outlined">
            <v-card-text>
              <div
                v-for="(file, index) in files"
                :key="index"
                :class="['file-item', { 'file-item-invalid': file.isValid === false }]"
              >
                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-icon class="mr-3" :color="file.isValid === false ? 'error' : 'primary'">
                      {{ getFileIcon(file) }}
                    </v-icon>
                    <div>
                      <div
                        class="font-weight-medium"
                        :class="{ 'text-error': file.isValid === false }"
                      >
                        {{ file.name }}
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        {{ formatFileSize(file.size) }}
                      </div>
                      <div v-if="file.isValid === false" class="text-caption text-error">
                        {{ file.errorMessage }}
                      </div>
                    </div>
                  </div>
                  <v-btn
                    icon="mdi-close"
                    variant="text"
                    size="small"
                    @click="removeFile(index)"
                    color="error"
                    :disabled="isLoading"
                  ></v-btn>
                </div>
                <v-divider v-if="index < files.length - 1" class="my-2"></v-divider>
              </div>
            </v-card-text>
          </v-card>
        </div>
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

// File limits from backend
const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TOTAL_SIZE: 100 * 1024 * 1024, // 100MB per batch
  MAX_FILES_PER_BATCH: 50,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_AUDIO_TYPES: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/m4a'],
}

// Component state
const files = ref([])
const selectedFileType = ref(null)
const fileInput = ref(null)
const isLoading = ref(false)
const isDragOver = ref(false)
const validationErrors = ref([])

// File types definition
const fileTypes = ['image', 'audio']

// Computed properties
const totalFileSize = computed(() => {
  return files.value.reduce((total, file) => {
    // Only count valid files towards total size
    return total + (file.isValid !== false ? file.size : 0)
  }, 0)
})

const canUpload = computed(() => {
  const validFiles = files.value.filter((file) => file.isValid !== false)
  return (
    selectedFileType.value &&
    validFiles.length > 0 &&
    files.value.every((file) => file.isValid !== false) && // All files must be valid
    validFiles.length <= FILE_LIMITS.MAX_FILES_PER_BATCH &&
    totalFileSize.value <= FILE_LIMITS.MAX_TOTAL_SIZE
  )
})

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
  if (!file.type) return 'mdi-file'
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
      return FILE_LIMITS.ALLOWED_IMAGE_TYPES.join(',')
    case 'audio':
      return FILE_LIMITS.ALLOWED_AUDIO_TYPES.join(',')
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
  if (isLoading.value) return
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleFileInputChange = (event) => {
  if (isLoading.value) return
  validateAndAddFiles(Array.from(event.target.files || []))
  // Reset file input so the same file can be selected again
  event.target.value = ''
}

// Drag and drop events
const handleDragOver = (e) => {
  if (isLoading.value) return
  e.preventDefault()
}

const handleDragEnter = (e) => {
  if (isLoading.value) return
  e.preventDefault()
  isDragOver.value = true
}

const handleDragLeave = () => {
  if (isLoading.value) return
  isDragOver.value = false
}

const handleDrop = (e) => {
  if (isLoading.value) return
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

  // Check if adding these files would exceed the batch limit
  if (files.value.length + newFiles.length > FILE_LIMITS.MAX_FILES_PER_BATCH) {
    validationErrors.value.push(
      `Cannot add ${newFiles.length} files. Maximum ${FILE_LIMITS.MAX_FILES_PER_BATCH} files per batch. Currently have ${files.value.length} files.`,
    )
    return
  }

  const filesToAdd = []
  let potentialTotalSize = totalFileSize.value

  newFiles.forEach((file) => {
    let isValid = true
    let errorMessage = ''

    // Check file size
    if (file.size > FILE_LIMITS.MAX_FILE_SIZE) {
      isValid = false
      errorMessage = `Exceeds maximum file size of ${formatFileSize(FILE_LIMITS.MAX_FILE_SIZE)}`
      validationErrors.value.push(`"${file.name}" ${errorMessage}`)
    }
    // Check if adding this file would exceed total size limit
    else if (potentialTotalSize + file.size > FILE_LIMITS.MAX_TOTAL_SIZE) {
      isValid = false
      errorMessage = `Would exceed maximum total size of ${formatFileSize(FILE_LIMITS.MAX_TOTAL_SIZE)}`
      validationErrors.value.push(`Adding "${file.name}" ${errorMessage}`)
    }
    // Validate file type
    else if (!validateFileType(file, selectedFileType.value)) {
      isValid = false
      const allowedTypes =
        selectedFileType.value === 'image'
          ? FILE_LIMITS.ALLOWED_IMAGE_TYPES
          : FILE_LIMITS.ALLOWED_AUDIO_TYPES
      errorMessage = `Invalid ${selectedFileType.value} file. Allowed: ${allowedTypes.join(', ')}`
      validationErrors.value.push(
        `"${file.name}" is not a valid ${selectedFileType.value} file. Allowed types: ${allowedTypes.join(', ')}`,
      )
    }
    // Check for duplicates
    else if (isDuplicateFile(file)) {
      isValid = false
      errorMessage = 'Duplicate file'
      validationErrors.value.push(`"${file.name}" is a duplicate file`)
    }

    // Add file to list with validation status
    const fileWithStatus = {
      // Copy essential File properties explicitly
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      // Keep reference to original file for upload
      originalFile: file,
      // Add validation properties
      isValid,
      errorMessage,
    }

    filesToAdd.push(fileWithStatus)

    // Only count valid files towards total size
    if (isValid) {
      potentialTotalSize += file.size
    }
  })

  // Add all files (valid and invalid) to the list
  if (filesToAdd.length > 0) {
    files.value = [...files.value, ...filesToAdd]
  }
}

const validateFileType = (file, type) => {
  if (type === 'image') {
    return FILE_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type)
  }
  if (type === 'audio') {
    return FILE_LIMITS.ALLOWED_AUDIO_TYPES.includes(file.type)
  }
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

const uploadFiles = async () => {
  if (!canUpload.value) return

  isLoading.value = true
  const formData = new FormData()

  // Add simple file type to the form data
  formData.append('type', selectedFileType.value)

  // Append only valid files
  Array.from(files.value).forEach((file) => {
    if (file.isValid !== false) {
      formData.append('files', file.originalFile || file)
    }
  })

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

.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
  border-color: rgba(var(--v-theme-on-surface), 0.2);
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

.file-item-invalid {
  background-color: rgba(var(--v-theme-error), 0.05);
  border-radius: 4px;
  padding: 0.75rem;
  margin: 0.25rem 0;
}
</style>
