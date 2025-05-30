<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ $t('files.massUpload') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <!-- File Type Selection -->
      <v-select
        v-model="selectedFileType"
        :label="$t('files.type')"
        :items="fileTypes"
        variant="outlined"
        density="comfortable"
        class="mb-6"
        :rules="[(v) => !!v || $t('validation.required')]"
        required
        :hint="$t('files.selectFileType')"
        persistent-hint
        :disabled="isLoading"
      ></v-select>

      <!-- File Limits Info -->
      <v-alert v-if="selectedFileType" type="info" variant="tonal" class="mb-4">
        <div class="text-subtitle-2 mb-2">{{ $t('files.uploadLimits') }}</div>
        <ul class="text-body-2">
          <li>
            {{ $t('files.maxFileSize', { size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE) }) }}
          </li>
          <li>
            {{ $t('files.maxTotalSize', { size: formatFileSize(FILE_LIMITS.MAX_TOTAL_SIZE) }) }}
          </li>
          <li>{{ $t('files.maxFilesPerBatch', { count: FILE_LIMITS.MAX_FILES_PER_BATCH }) }}</li>
          <li>{{ $t('files.currentTotalSize', { size: formatFileSize(totalFileSize) }) }}</li>
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
              <template v-if="isLoading">{{ $t('files.processingFiles') }}</template>
              <template v-else>{{
                files.length > 0
                  ? $t('files.filesSelected', { count: files.length })
                  : $t('files.dropFilesHere')
              }}</template>
            </div>
            <div class="text-body-2 text-medium-emphasis mb-4">
              <template v-if="!isLoading">{{
                $t('files.clickToBrowse', { type: selectedFileType })
              }}</template>
            </div>
            <v-chip
              v-if="selectedFileType && !isLoading"
              color="primary"
              variant="tonal"
              size="small"
              class="mb-2"
            >
              {{ $t('files.accepted', { types: getAcceptedFormats(selectedFileType) }) }}
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
              {{
                $t('files.selectedFiles', {
                  validCount: files.filter((f) => f.isValid !== false).length,
                  totalCount: files.length,
                  maxCount: FILE_LIMITS.MAX_FILES_PER_BATCH,
                })
              }}
            </div>
            <v-btn
              size="small"
              color="error"
              variant="text"
              prepend-icon="mdi-delete-sweep"
              @click="clearFiles"
              :disabled="isLoading"
            >
              {{ $t('files.clearAll') }}
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
        :text="$t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        :text="$t('common.save')"
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
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const emits = defineEmits(['close', 'reset'])
const { snackbar } = storeToRefs(useBaseStore())

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
      return '.jpg, .jpeg, .png, .gif, .webp, .svg, .tiff, .bmp, .ico, .heic'
    case 'audio':
      return '.mp3'
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
    validationErrors.value.push(t('files.selectFileTypeFirst'))
    return
  }

  // Check if adding these files would exceed the batch limit
  if (files.value.length + newFiles.length > FILE_LIMITS.MAX_FILES_PER_BATCH) {
    validationErrors.value.push(
      t('files.cannotAddFiles', {
        count: newFiles.length,
        max: FILE_LIMITS.MAX_FILES_PER_BATCH,
        current: files.value.length,
      }),
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
      errorMessage = t('files.exceedsFileSize', { size: formatFileSize(FILE_LIMITS.MAX_FILE_SIZE) })
      validationErrors.value.push(`"${file.name}" ${errorMessage}`)
    }
    // Check if adding this file would exceed total size limit
    else if (potentialTotalSize + file.size > FILE_LIMITS.MAX_TOTAL_SIZE) {
      isValid = false
      errorMessage = t('files.exceedsTotalSize', {
        size: formatFileSize(FILE_LIMITS.MAX_TOTAL_SIZE),
      })
      validationErrors.value.push(`${t('common.adding')} "${file.name}" ${errorMessage}`)
    }
    // Validate file type
    else if (!validateFileType(file, selectedFileType.value)) {
      isValid = false
      const allowedTypes =
        selectedFileType.value === 'image'
          ? FILE_LIMITS.ALLOWED_IMAGE_TYPES
          : FILE_LIMITS.ALLOWED_AUDIO_TYPES
      errorMessage = t('files.invalidFileType', {
        type: selectedFileType.value,
        types: allowedTypes.join(', '),
      })
      validationErrors.value.push(
        t('files.notValidFileType', {
          name: file.name,
          type: selectedFileType.value,
          types: allowedTypes.join(', '),
        }),
      )
    }
    // Check for duplicates
    else if (isDuplicateFile(file)) {
      isValid = false
      errorMessage = t('files.duplicateFile')
      validationErrors.value.push(t('files.isDuplicateFile', { name: file.name }))
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
      text: t('files.massUploadSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }

    resetForm()
    emits('reset')
  } catch (error) {
    console.error('Upload error:', error)
    snackbar.value = {
      show: true,
      text: t('files.errorUploadingFiles'),
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
