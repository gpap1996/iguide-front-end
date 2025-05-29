<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title :title="$t('files.title')">
      <!-- Create/Upload Button Group -->
      <v-btn-group variant="outlined" class="mr-3" density="comfortable">
        <v-btn
          @click="fileFormDialog = true"
          color="primary"
          icon="mdi-plus"
          v-tooltip="$t('files.upload')"
        ></v-btn>

        <v-btn
          @click="fileMassUploadDialog = true"
          color="primary"
          icon="mdi-plus-box-multiple"
          v-tooltip="$t('files.massUpload')"
        ></v-btn>
      </v-btn-group>
      <!-- Bulk Actions Button Group -->
      <v-btn-group variant="outlined" class="mr-3" density="comfortable">
        <v-btn
          @click="toggleMassAction('delete')"
          :color="massAction && massActionType === 'delete' ? 'error' : 'primary'"
          :icon="massAction && massActionType === 'delete' ? 'mdi-close' : 'mdi-delete-outline'"
          v-tooltip="
            massAction && massActionType === 'delete' ? $t('common.cancel') : $t('files.massDelete')
          "
          :disabled="data?.pagination?.totalItems === 0"
        ></v-btn>
        <v-btn
          @click="toggleMassAction('copy')"
          :color="massAction && massActionType === 'copy' ? 'error' : 'primary'"
          :icon="massAction && massActionType === 'copy' ? 'mdi-close' : 'mdi-content-copy'"
          v-tooltip="
            massAction && massActionType === 'copy' ? $t('common.cancel') : $t('files.copySelected')
          "
          :disabled="data?.pagination?.totalItems === 0"
        ></v-btn>
      </v-btn-group>

      <!-- Import/Export Button Group -->
      <v-btn-group variant="outlined" class="mr-3" density="comfortable">
        <v-btn
          @click="openImportDialog"
          color="primary"
          icon="mdi-file-import"
          :loading="isImporting"
          v-tooltip="$t('files.importExcel')"
        ></v-btn>

        <v-btn
          @click="exportToExcel"
          color="primary"
          icon="mdi-file-export"
          :loading="isExporting"
          v-tooltip="$t('files.exportExcel')"
          :disabled="data?.pagination?.totalItems === 0"
        ></v-btn>
      </v-btn-group>
      <!-- Mass Action Controls - Visible when mass action is active -->
      <v-fade-transition>
        <div v-if="massAction" class="d-flex align-center mr-4">
          <v-chip color="primary" variant="tonal" class="mr-4">
            {{ $t('files.itemsSelected', { count: selected.length }) }}
          </v-chip>

          <!-- Delete action button -->
          <v-btn
            v-if="massActionType === 'delete'"
            size="small"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete-sweep"
            class="mr-2"
            :disabled="selected.length === 0"
            :loading="isDeleteLoading"
            @click="confirmMassDelete"
          >
            {{ $t('files.deleteSelected') }}
          </v-btn>

          <!-- Copy action button -->
          <v-btn
            v-if="massActionType === 'copy'"
            size="small"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-content-copy"
            class="mr-2"
            :disabled="selected.length === 0"
            :loading="isCopying"
            @click="copySelectedIds"
          >
            {{ $t('files.copySelected') }}
          </v-btn>
        </div>
      </v-fade-transition>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        :label="$t('files.search')"
        clearable
        hide-details
        class="ml-auto"
        density="compact"
        @click:clear="
          () =>
            (filters = {
              ...filters,
              title: null,
              page: 1,
            })
        "
        @input="(e) => updateFilters(e.target.value)"
      >
      </v-text-field>
    </page-title>

    <v-data-table-server
      v-model="selected"
      :headers="headers"
      :items="data?.files"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
      :show-select="massAction"
    >
      <template v-slot:[`item.preview`]="{ item }">
        <v-img
          v-if="item.type == 'image'"
          width="100px"
          height="67px"
          cover
          class="my-4 rounded-xl"
          alt="image"
          :src="`${item.thumbnailUrl}`"
        />

        <v-icon v-else icon="mdi-file-cancel-outline"></v-icon>
      </template>

      <template v-slot:[`item.title`]="{ item }">
        <div
          class="d-flex align-center mb-2"
          v-for="tr in item?.translations"
          :key="tr.language.locale"
        >
          <v-chip
            density="compact"
            size="small"
            variant="tonal"
            color="primary"
            class="mr-2"
            style="width: 32px"
          >
            {{ tr.language.locale }}
          </v-chip>

          <div :class="{ 'font-weight-bold': tr.language.locale == 'el' }">
            {{ tr.title }}
          </div>
        </div>
        <!-- <span v-else> - </span> -->
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <v-icon v-if="item.type == 'image'" icon="mdi-image"> </v-icon>
        <v-icon v-if="item.type == 'audio'" icon="mdi-music-circle"> </v-icon>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <!-- Copy menu with options -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              variant="text"
              icon="mdi-content-copy"
              class="mr-1"
              v-bind="props"
              v-tooltip="$t('files.copyId')"
            ></v-btn>
          </template>
          <v-list density="compact">
            <v-list-item
              @click="copyToClipboard(item, 'id')"
              prepend-icon="mdi-identifier"
              :title="$t('files.copyId')"
            ></v-list-item>
            <v-list-item
              @click="copyToClipboard(item, 'url')"
              prepend-icon="mdi-link"
              :title="$t('files.copyUrl')"
            ></v-list-item>
            <v-list-item
              @click="copyToClipboard(item, 'name')"
              prepend-icon="mdi-file"
              :title="$t('files.copyName')"
            ></v-list-item>
          </v-list>
        </v-menu>

        <v-btn
          variant="text"
          icon="mdi-pencil"
          class="mr-1"
          @click="(currentFile = item), (fileFormDialog = true)"
          v-tooltip="$t('files.edit')"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(currentFile = item), (fileDeleteDialog = true)"
          v-tooltip="$t('files.delete')"
        >
        </v-btn>
      </template>
      <!-- table footer -->
      <template v-slot:bottom>
        <v-divider></v-divider>
        <div class="d-flex ml-auto mr-10 mt-6">
          <div class="mt-2 mr-2">Items per page:</div>
          <v-select
            variant="outlined"
            item-title="label"
            item-value="value"
            density="compact"
            :value="filters.itemsPerPage"
            @update:model-value="
              (itemsPerPage) => {
                filters = {
                  ...filters,
                  itemsPerPage,
                  page: 1,
                }
              }
            "
            :items="itemsPerPageDropdown"
            width="90px"
            :disabled="!data?.pagination?.totalItems"
          >
          </v-select>
          <div v-if="data?.pagination?.totalItems" class="mt-2 ml-2">
            {{ (filters.page - 1) * filters.itemsPerPage + 1 }} of
            {{ data?.pagination?.totalItems || '...' }}
          </div>
          <div v-else class="mt-2 ml-2">-</div>
        </div>
      </template>

      <template v-slot:loading>
        <table-loader :headers="headers"></table-loader>
      </template>
    </v-data-table-server>

    <v-pagination
      v-model="filters.page"
      :length="data?.pagination?.totalPages"
      :total-visible="7"
      class="mt-10"
    ></v-pagination>

    <v-dialog v-model="fileFormDialog" max-width="700px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <file-form
          :file="currentFile"
          @reset="onFiltersReset('save')"
          @close="(fileFormDialog = false), (currentFile = null)"
        ></file-form>
      </div>
    </v-dialog>

    <v-dialog v-model="fileMassUploadDialog" max-width="700px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <file-mass-upload
          @reset="onFiltersReset('save')"
          @close="fileMassUploadDialog = false"
        ></file-mass-upload>
      </div>
    </v-dialog>
    <v-dialog v-model="fileDeleteDialog" max-width="500px">
      <confirm-dialog
        :title="$t('files.delete')"
        :isLoading="isDeleteLoading"
        @close="(fileDeleteDialog = false), (currentFile = null)"
        @confirm="onDeleteFile"
      >
        {{ $t('files.deleteConfirm') }}
      </confirm-dialog>
    </v-dialog>
    <v-dialog v-model="massDeleteDialog" max-width="500px">
      <confirm-dialog
        :title="$t('files.massDelete')"
        :isLoading="isDeleteLoading"
        @close="massDeleteDialog = false"
        @confirm="onMassDeleteFiles"
      >
        {{ $t('files.massDeleteConfirm', { count: selected.length }) }}
      </confirm-dialog>
    </v-dialog>

    <!-- Import Excel Dialog -->
    <v-dialog v-model="importDialog" max-width="500px">
      <v-card>
        <v-card-title class="d-flex align-center bg-primary-darken-1">
          <div class="title">{{ $t('files.importTitle') }}</div>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="importDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-6">
          <p class="mb-4">
            {{ $t('files.importDescription') }}
          </p>
          <v-file-input
            v-model="importFile"
            :label="$t('files.importExcel')"
            accept=".xlsx"
            prepend-icon="mdi-file-excel"
            show-size
            variant="outlined"
            density="comfortable"
            :rules="[(v) => !!v || $t('validation.fileRequired')]"
          ></v-file-input>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="outlined"
            :text="$t('common.cancel')"
            @click="importDialog = false"
            class="mr-2"
          ></v-btn>
          <v-btn
            color="primary"
            :text="$t('files.importExcel')"
            variant="flat"
            @click="importExcel"
            :loading="isImporting"
            :disabled="!importFile"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { debounce } from 'lodash'
import { useClipboard } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const baseStore = useBaseStore()
const { itemsPerPageDropdown } = baseStore
const { snackbar } = storeToRefs(baseStore)

const { t } = useI18n()

const fileFormDialog = ref(false)
const fileMassUploadDialog = ref(false)
const fileDeleteDialog = ref(false)
const massDeleteDialog = ref(false)
const importDialog = ref(false)
const isDeleteLoading = ref(false)
const isExporting = ref(false)
const isImporting = ref(false)
const isCopying = ref(false)
const currentFile = ref(null)
const importFile = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const selected = ref([])
const massAction = ref(false)
const massActionType = ref('delete') // 'delete' or 'copy'

const headers = [
  {
    title: 'Preview',
    key: 'preview',
    sortable: false,
  },

  {
    title: 'Name',
    key: 'name',
    sortable: false,
  },

  {
    title: 'Title',
    key: 'title',
    sortable: false,
  },

  {
    title: 'Type',
    key: 'type',
    sortable: false,
  },

  {
    title: 'Actions',
    key: 'actions',
    align: 'start',
    sortable: false,
  },
]

const fetchFiles = async () => {
  const res = await axios.get('/files', {
    params: {
      limit: filters.value.itemsPerPage,
      page: filters.value.page,
      title: filters.value.title,
    },
  })

  await new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, 500)
  })

  return res.data
}
const queryClient = useQueryClient()

const { isLoading, data } = useQuery({
  queryKey: ['files', filters],
  queryFn: fetchFiles,
  retry: 0,
})

const onFiltersReset = async (action) => {
  if (action == 'save') {
    fileFormDialog.value = false
    fileMassUploadDialog.value = false
  }

  await queryClient.resetQueries({ queryKey: ['files'] })
}

// Debounced function for updating filters
const updateFilters = debounce((value) => {
  filters.value = {
    ...filters.value,
    title: value,
    page: 1,
  }
}, 300)

const onDeleteFile = async () => {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/files/${currentFile.value.id}`)
    fileDeleteDialog.value = false

    if (data.value?.files?.length == 1 && filters.value.page > 1)
      filters.value = {
        ...filters.value,
        title: null,
        page: 1,
      }
    else await onFiltersReset()

    snackbar.value = {
      show: true,
      text: t('files.deleteSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
  } finally {
    isDeleteLoading.value = false
    currentFile.value = null
  }
}

// Mass action functionality
const toggleMassAction = (type) => {
  // If already in mass action mode with the same type, cancel it
  if (massAction.value && massActionType.value === type) {
    massAction.value = false
    selected.value = []
    return
  }

  // If already in mass action mode but different type, switch types
  if (massAction.value && massActionType.value !== type) {
    massActionType.value = type
    return
  }

  // If not in mass action mode, enable it with the selected type
  massAction.value = true
  massActionType.value = type
}

const cancelMassAction = () => {
  massAction.value = false
  selected.value = []
  massActionType.value = 'delete' // Reset to default
}

const confirmMassDelete = () => {
  if (selected.value.length > 0) {
    massDeleteDialog.value = true
  }
}

const onMassDeleteFiles = async () => {
  if (selected.value.length === 0) return

  isDeleteLoading.value = true
  try {
    await axios.post('/files/mass-delete', { ids: selected.value })
    massDeleteDialog.value = false

    if (selected.value.length >= data.value?.files?.length) {
      filters.value = {
        ...filters.value,
        page: 1,
      }
    }

    cancelMassAction()

    await onFiltersReset()

    snackbar.value = {
      show: true,
      text: t('files.massDeleteSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
  } finally {
    isDeleteLoading.value = false
  }
}

// Excel Export functionality
const exportToExcel = async () => {
  isExporting.value = true
  try {
    const date = new Date()
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const filename = `files_export_${dateString}.xlsx`

    const response = await axios.get('/files/export-excel', {
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()

    window.URL.revokeObjectURL(url)
    document.body.removeChild(link)

    snackbar.value = {
      show: true,
      text: t('files.exportSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.error('Error exporting Excel:', error)
    snackbar.value = {
      show: true,
      text: t('common.error'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isExporting.value = false
  }
}

// Clipboard functionality
const { copy: copyToClip } = useClipboard()

// Function to copy selected IDs to clipboard
const copySelectedIds = async () => {
  if (selected.value.length === 0) return

  isCopying.value = true
  try {
    // Convert the array of IDs to a comma-separated string
    const idsText = selected.value.join(', ')

    // Copy to clipboard
    await copyToClip(idsText)

    // Show success message
    snackbar.value = {
      show: true,
      text: `${selected.value.length} file IDs copied to clipboard`,
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }

    // Keep mass action enabled so user can make additional selections if needed
    // But only clear if there's a success
    selected.value = []
    massAction.value = false
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    snackbar.value = {
      show: true,
      text: 'Failed to copy IDs to clipboard',
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isCopying.value = false
  }
}

// Function to copy individual item ID or URL to clipboard
const copyToClipboard = async (item, type = 'id') => {
  try {
    let copyText = ''

    if (type === 'id') {
      copyText = item.id
    } else if (type === 'url') {
      copyText = `${item.url}`
    } else if (type === 'name') {
      copyText = item.name
    }

    await copyToClip(copyText)

    snackbar.value = {
      show: true,
      text: t('files.copySuccess', {
        type: t(`files.copy${type.charAt(0).toUpperCase() + type.slice(1)}`),
      }),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error)
    snackbar.value = {
      show: true,
      text: t('common.error'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  }
}

// Excel Import functionality
const openImportDialog = () => {
  importDialog.value = true
  importFile.value = null
}

const importExcel = async () => {
  if (!importFile.value) return

  isImporting.value = true
  try {
    const formData = new FormData()
    formData.append('file', importFile.value)

    await axios.post('/files/import-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    importDialog.value = false
    importFile.value = null

    snackbar.value = {
      show: true,
      text: t('files.importSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }

    await onFiltersReset()
  } catch (error) {
    console.error('Error importing Excel:', error)
    snackbar.value = {
      show: true,
      text: error.response?.data?.details || t('common.error'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isImporting.value = false
  }
}
</script>

<style lang="scss" scoped></style>
