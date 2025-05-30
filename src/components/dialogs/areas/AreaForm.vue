<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ !isEdit ? $t('areas.create') : $t('areas.edit') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>
    <v-progress-circular
      v-if="isPageLoading"
      indeterminate
      class="mt-4 px-4 mx-auto mb-auto mt-auto"
      color="primary"
      size="100"
    ></v-progress-circular>
    <v-tabs
      v-if="!isPageLoading"
      v-model="tab"
      :show-arrows="true"
      class="mt-4 px-4"
      color="primary"
    >
      <v-tab value="Basic Information">
        {{ $t('areas.basicInfo') }}
        <v-icon v-if="validationError" color="error" class="ml-2">mdi-alert-circle</v-icon>
      </v-tab>
      <v-tab value="Files">{{ $t('areas.filesTab') }}</v-tab>
    </v-tabs>

    <v-tabs-window v-if="!isPageLoading" v-model="tab" class="mt-8" id="single-user-tabs">
      <v-tabs-window-item value="Basic Information">
        <area-basic-information ref="basicInfoRef" />
      </v-tabs-window-item>

      <v-tabs-window-item value="Files"> <area-files /> </v-tabs-window-item>
    </v-tabs-window>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        variant="outlined"
        :text="$t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        :disabled="isPageLoading"
        :loading="isLoading"
        color="primary"
        :text="$t('common.save')"
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
import axios from 'axios'
import { useFilesStore } from '@/stores/files'
import { useExternalFilesStore } from '@/stores/externalFiles'
import { useI18n } from 'vue-i18n'

const areasStore = useAreasStore()
const { submitArea, fetchAreaById } = areasStore
const { isEdit, areas } = storeToRefs(areasStore)

const filesStore = useFilesStore()
const { getFilesDropdown } = filesStore

const externalFilesStore = useExternalFilesStore()
const { getExternalFilesDropdown } = externalFilesStore

const baseStore = useBaseStore()
const { snackbar } = storeToRefs(baseStore)

const { t } = useI18n()

const isPageLoading = ref(false)

onMounted(async () => {
  isPageLoading.value = true

  if (props?.areaId) {
    await fetchAreaById(props.areaId)
  }

  try {
    const areasRes = await axios.get('/areas/dropdown', {
      headers: {
        'Accept-Language': 'el',
      },
    })

    if (props?.areaId) {
      areas.value = areasRes.data.items.filter((area) => area.id !== props.areaId)
    } else {
      areas.value = areasRes.data.items
    }

    await getFilesDropdown()
    await getExternalFilesDropdown()
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `Something went wrong ${error}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isPageLoading.value = false
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
    if (basicInfoRef.value && !basicInfoRef.value.validateAllLanguages()) {
      tab.value = 'Basic Information'
      validationError.value = true
      snackbar.value = {
        show: true,
        text: t('validation.titleRequired'),
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
      text: t('areas.saveSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: t('areas.saveError', { error }),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
