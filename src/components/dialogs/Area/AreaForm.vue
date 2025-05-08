<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">Create Area</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <v-tabs v-model="tab" :show-arrows="true" class="mt-4 px-4" color="primary">
      <v-tab value="Basic Information">Basic Information</v-tab>
      <v-tab value="Media">Media</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="mt-8" id="single-user-tabs">
      <v-tabs-window-item value="Basic Information">
        <area-basic-information />
      </v-tabs-window-item>

      <v-tabs-window-item value="Media"> Media </v-tabs-window-item>
    </v-tabs-window>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" text="Close" @click="$emit('close')" class="mr-2"></v-btn>
      <v-btn
        :isLoading="isLoading"
        color="primary"
        text="Save"
        variant="flat"
        @click="onSave"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'
import { useAreasStore } from '@/stores/areas'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const areasStore = useAreasStore()
const { submitArea } = areasStore

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)

const emits = defineEmits(['reset'])
const tab = ref(null)
const isLoading = ref(false)

async function onSave() {
  try {
    await submitArea()
    snackbar.value = {
      show: true,
      text: 'Area saved successfully!',
      color: 'success',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `Error handling area ${error}`,
      color: 'error',
    }
  } finally {
    isLoading.value = false
  }
  emits('reset')
}
</script>

<style lang="scss" scoped></style>
