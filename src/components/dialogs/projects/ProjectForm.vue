<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ project ? 'Edit Project' : 'Create Project' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>
    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="projectFormRef">
        <v-text-field
          v-model="form.name"
          density="comfortable"
          variant="outlined"
          label="Name"
          :rules="[rules.required]"
        ></v-text-field>

        <v-textarea
          v-model="form.description"
          density="comfortable"
          variant="outlined"
          label="Description"
          rows="3"
          auto-grow
          class="mt-4"
        ></v-textarea>

        <v-file-input
          v-model="form.file"
          density="comfortable"
          variant="outlined"
          label="Logo (Optional)"
          prepend-icon="mdi-camera"
          accept="image/*"
          show-size
          clearable
          class="mt-4"
          :rules="[rules.fileSize]"
        ></v-file-input>

        <v-switch
          v-model="form.status"
          color="primary"
          label="Active"
          class="mt-4"
          hide-details
        ></v-switch>
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
        @click="onSubmitProject"
        :loading="loader"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const { project } = defineProps({ project: Object })
const emits = defineEmits(['close', 'reset'])

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)
const projectFormRef = ref(null) // Ref for the v-form

const loader = ref(false)

const form = ref({
  name: null,
  description: null,
  status: true,
  file: null,
})

const rules = {
  required: (value) => !!value || 'This field is required.',
  fileSize: (value) => {
    if (!value || value.length === 0) return true // No file selected is valid
    const file = value[0] // v-file-input returns an array
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    return (
      file.size < maxSize ||
      `File size should be less than 2 MB! Current size: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
    )
  },
}

onMounted(() => {
  if (project) {
    form.value = {
      ...project,
      file: null,
    }
  }
})

const onSubmitProject = async () => {
  const { valid } = await projectFormRef.value.validate()
  if (!valid) {
    snackbar.value = {
      show: true,
      text: 'Please correct the form errors.',
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
    return
  }
  try {
    loader.value = true
    const formData = new FormData()
    formData.append('name', form.value.name || '')
    formData.append('description', form.value.description || '')
    formData.append('status', form.value.status)

    if (form.value.file) {
      formData.append('file', form.value.file)
    }
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

    if (project) {
      await axios.put(`/projects/${project.id}`, formData, config)
    } else {
      await axios.post('/projects', formData, config)
    }

    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error?.response?.data?.error || 'An error occurred'} `,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    loader.value = false
  }
}
</script>

<style lang="scss" scoped></style>
