<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Media">
      <v-btn
        @click="mediaFormDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus"
        class="mr-2"
      ></v-btn>

      <v-btn
        :disabled="true"
        @click="mediaMassUploadDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus-box-multiple"
        class="mr-2"
      ></v-btn>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        label="Search Media"
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
      :headers="headers"
      :items="data?.media"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
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
        <span v-else> - </span>
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
          @click="(currentMedia = item), (mediaFormDialog = true)"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(currentMedia = item), (mediaDeleteDialog = true)"
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

    <v-dialog v-model="mediaFormDialog" max-width="700px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <media-form
          :media="currentMedia"
          @reset="onFiltersReset('save')"
          @close="(mediaFormDialog = false), (currentMedia = null)"
        ></media-form>
      </div>
    </v-dialog>

    <v-dialog v-model="mediaDeleteDialog" max-width="500px">
      <confirm-dialog
        title="Delete media"
        :isLoading="isDeleteLoading"
        @close="(mediaDeleteDialog = false), (currentMedia = null)"
        @confirm="onDeleteMedia"
      >
        Are you sure you want to delete the media?
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

const mediaFormDialog = ref(false)
const mediaDeleteDialog = ref(false)
const isDeleteLoading = ref(false)
const currentMedia = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

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

const fetchMedia = async () => {
  const res = await axios.get('/media', {
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
  queryKey: ['media', filters],
  queryFn: fetchMedia,
  retry: 0,
})

const onFiltersReset = async (action) => {
  if (action == 'save') mediaFormDialog.value = false

  await queryClient.resetQueries({ queryKey: ['media'] })
}

// Debounced function for updating filters
const updateFilters = debounce((value) => {
  filters.value = {
    ...filters.value,
    title: value,
    page: 1,
  }
}, 300)

const onDeleteMedia = async () => {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/media/${currentMedia.value.id}`)
    mediaDeleteDialog.value = false

    if (data.value?.media?.length == 1 && filters.value.page > 1)
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
    currentMedia.value = null
  }
}
</script>

<style lang="scss" scoped></style>
