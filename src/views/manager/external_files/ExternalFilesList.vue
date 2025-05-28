<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="External Files">
      <!-- Create Button -->
      <v-btn
        @click="fileFormDialog = true"
        color="primary"
        icon="mdi-plus"
        variant="outlined"
        class="mr-3"
        density="comfortable"
        v-tooltip="'Add External File'"
      ></v-btn>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        label="Search External Files"
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
      :items="data?.externalFiles"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
    >
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
      </template>

      <template v-slot:[`item.type`]="{ item }">
        <v-icon v-if="item.type === 'video'" icon="mdi-video"></v-icon>
        <v-icon v-else-if="item.type === 'model'" icon="mdi-cube"></v-icon>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          icon="mdi-pencil"
          class="mr-1"
          @click="(currentFile = item), (fileFormDialog = true)"
          v-tooltip="'Edit External File'"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(currentFile = item), (fileDeleteDialog = true)"
          v-tooltip="'Delete External File'"
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
        <external-file-form
          :file="currentFile"
          @reset="onFiltersReset('save')"
          @close="(fileFormDialog = false), (currentFile = null)"
        ></external-file-form>
      </div>
    </v-dialog>

    <v-dialog v-model="fileDeleteDialog" max-width="500px">
      <confirm-dialog
        title="Delete external file"
        :isLoading="isDeleteLoading"
        @close="(fileDeleteDialog = false), (currentFile = null)"
        @confirm="onDeleteFile"
      >
        Are you sure you want to delete this external file?
      </confirm-dialog>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { debounce } from 'lodash'
import { storeToRefs } from 'pinia'
import axios from 'axios'

const baseStore = useBaseStore()
const { itemsPerPageDropdown } = baseStore
const { snackbar } = storeToRefs(baseStore)

const fileFormDialog = ref(false)
const fileDeleteDialog = ref(false)
const isDeleteLoading = ref(false)
const currentFile = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const selected = ref([])

const headers = [
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

const fetchExternalFiles = async () => {
  const res = await axios.get('/external-files', {
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
  queryKey: ['external-files', filters],
  queryFn: fetchExternalFiles,
  retry: 0,
})

const onFiltersReset = async (action) => {
  if (action == 'save') {
    fileFormDialog.value = false
  }

  await queryClient.resetQueries({ queryKey: ['external-files'] })
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
    await axios.delete(`/external-files/${currentFile.value.id}`)
    fileDeleteDialog.value = false

    if (data.value?.externalFiles?.length == 1 && filters.value.page > 1)
      filters.value = {
        ...filters.value,
        title: null,
        page: 1,
      }
    else await onFiltersReset()

    snackbar.value = {
      show: true,
      text: 'External file deleted successfully',
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
    snackbar.value = {
      show: true,
      text: error.response?.data?.error || 'Error deleting external file',
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isDeleteLoading.value = false
    currentFile.value = null
  }
}
</script>

<style lang="scss" scoped></style>
