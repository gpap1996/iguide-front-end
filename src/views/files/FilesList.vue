<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Files">
      <v-btn
        @click="fileFormDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus"
        class="mr-2"
      ></v-btn>
      <v-btn
        @click="fileMassUploadDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus-box-multiple"
        class="mr-2"
      ></v-btn>

      <v-btn
        @click="toggleMassAction"
        size="x-small"
        :color="massAction ? 'error' : 'primary'"
        :icon="massAction ? 'mdi-close' : 'mdi-delete-outline'"
        class="mr-2"
      ></v-btn>

      <!-- Mass Action Controls - Visible when mass action is active -->
      <v-fade-transition>
        <div v-if="massAction" class="d-flex align-center mr-4">
          <v-chip color="primary" variant="tonal" class="mr-4">
            {{ selected.length }} items selected
          </v-chip>

          <v-btn
            size="small"
            color="error"
            variant="tonal"
            prepend-icon="mdi-delete-sweep"
            class="mr-2"
            :disabled="selected.length === 0"
            :loading="isDeleteLoading"
            @click="confirmMassDelete"
          >
            Confirm
          </v-btn>
        </div>
      </v-fade-transition>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        label="Search Files"
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
      <template v-slot:[`item.url`]="{ item }">
        <v-img
          v-if="item.type == 'image'"
          width="100px"
          height="67px"
          cover
          class="my-4 rounded-xl"
          alt="image"
          :src="`http://localhost:3000${item.url}`"
          :lazy-src="`http://localhost:3000${item.thumbnailUrl}`"
        />

        <v-icon v-else color="white" icon="mdi-file-question-outline"></v-icon>
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
        <v-icon v-if="item.type == 'audio'" icon="mdi-play-circle"> </v-icon>
        <v-icon v-if="item.type == 'video'" icon="mdi-video"> </v-icon>
        <v-icon v-if="item.type == 'tiles'" icon="mdi-layers"> </v-icon>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          class="mr-4"
          icon="mdi-pencil"
          @click="(currentFiles = item), (fileFormDialog = true)"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(currentFiles = item), (fileDeleteDialog = true)"
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
          :file="currentFiles"
          @reset="onFiltersReset('save')"
          @close="(fileFormDialog = false), (currentFiles = null)"
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
        title="Delete file"
        :isLoading="isDeleteLoading"
        @close="(fileDeleteDialog = false), (currentFiles = null)"
        @confirm="onDeleteFiles"
      >
        Are you sure you want to delete the file?
      </confirm-dialog>
    </v-dialog>

    <v-dialog v-model="massDeleteDialog" max-width="500px">
      <confirm-dialog
        title="Mass Delete Files"
        :isLoading="isDeleteLoading"
        @close="massDeleteDialog = false"
        @confirm="onMassDeleteFiles"
      >
        Are you sure you want to delete {{ selected.length }} selected files? This action cannot be
        undone.
      </confirm-dialog>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { debounce } from 'lodash'
const { itemsPerPageDropdown } = useBaseStore()

const fileFormDialog = ref(false)
const fileMassUploadDialog = ref(false)
const fileDeleteDialog = ref(false)
const massDeleteDialog = ref(false)
const isDeleteLoading = ref(false)
const currentFiles = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const selected = ref([])
const massAction = ref(false)

const headers = [
  {
    title: 'Preview',
    key: 'url',
    sortable: false,
  },

  {
    title: 'File Name',
    key: 'fileName',
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

const onDeleteFiles = async () => {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/files/${currentFiles.value.id}`)
    fileDeleteDialog.value = false

    if (data.value?.files?.length == 1 && filters.value.page > 1)
      filters.value = {
        ...filters.value,
        title: null,
        page: 1,
      }
    else await onFiltersReset()
  } catch (error) {
    console.log(error)
  } finally {
    isDeleteLoading.value = false
    currentFiles.value = null
  }
}

// Mass delete functionality
const toggleMassAction = () => {
  massAction.value = !massAction.value
  if (!massAction.value) {
    selected.value = []
  }
}

const cancelMassAction = () => {
  massAction.value = false
  selected.value = []
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
    // Send the array of selected IDs to the backend
    await axios.post('/files/mass-delete', { ids: selected.value })
    massDeleteDialog.value = false

    // Reset to first page if all items on current page were deleted
    if (selected.value.length >= data.value?.files?.length) {
      filters.value = {
        ...filters.value,
        page: 1,
      }
    }

    // Reset selection and mass action mode
    cancelMassAction()

    // Refresh the data
    await onFiltersReset()
  } catch (error) {
    console.log(error)
  } finally {
    isDeleteLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
