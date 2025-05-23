<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ !isEdit ? 'Create Area' : 'Edit Area' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>
    <v-tabs v-model="tab" :show-arrows="true" class="mt-4 px-4" color="primary">
      <v-tab value="Basic Information">
        Basic Information
        <v-icon v-if="validationError" color="error" class="ml-2">mdi-alert-circle</v-icon>
      </v-tab>
      <v-tab value="Files">Files</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="mt-8" id="single-user-tabs">
      <v-tabs-window-item value="Basic Information">
        <area-basic-information ref="basicInfoRef" />
      </v-tabs-window-item>

      <v-tabs-window-item value="Files"> <area-files /> </v-tabs-window-item>
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
import { onMounted, ref, watch } from 'vue'
import { useAreasStore } from '@/stores/areas'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const areasStore = useAreasStore()
const { submitArea, fetchAreaById } = areasStore
const { isEdit } = storeToRefs(areasStore)

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)

onMounted(async () => {
  if (props?.areaId) {
    await fetchAreaById(props.areaId)
  }
})

const props = defineProps({
  areaId: {
    type: Number,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['reset', 'close'])
const tab = ref(null)
const isLoading = ref(false)
const basicInfoRef = ref(null)
const validationError = ref(false)

// Watch the tab changes to reset error states
watch(tab, () => {
  validationError.value = false
})

async function onSave() {
  isLoading.value = true
  try {
    // Validate that all languages have required fields
    if (basicInfoRef.value && !basicInfoRef.value.validateAllLanguages()) {
      tab.value = 'Basic Information'
      validationError.value = true
      snackbar.value = {
        show: true,
        text: 'Title and description are required for all languages',
        color: 'error',
        icon: 'mdi-alert-circle-outline',
      }
      isLoading.value = false
      return
    }

    validationError.value = false
    await submitArea()
    snackbar.value = {
      show: true,
      text: 'Area saved successfully!',
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `Error handling area ${error}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
