<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ project ? 'Edit Project' : 'Create Project' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>
    <div class="pa-8 scrollable flex-grow-1">
      <v-form>
        <v-text-field
          v-model="form.name"
          density="comfortable"
          variant="outlined"
          label="Name"
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
      <v-btn color="primary" text="Save" variant="flat" @click="onSubmitProject"></v-btn>
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

const form = ref({
  name: null,
  description: null,
  status: true,
})

onMounted(() => {
  if (project) {
    form.value = { ...project }
  }
})

const onSubmitProject = async () => {
  try {
    if (project) {
      await axios.put(`/projects/${project.id}`, {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        locale: form.value.locale,
      })
    } else {
      await axios.post('/projects', {
        name: form.value.name,
        description: form.value.description,
        status: form.value.status,
        locale: form.value.locale,
      })
    }

    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error?.response?.data?.error || 'An error occurred'}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  }
}
</script>

<style lang="scss" scoped></style>
