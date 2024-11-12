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
        @click="mediaMassUploadDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus-box-multiple"
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
        @keydown.enter="
          (e) => {
            filters = {
              ...filters,
              title: e.target.value,
              page: 1,
            }
          }
        "
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
          width="100px"
          cover
          aspect-ratio="16 / 9"
          class="my-4 rounded-xl"
          alt="image"
          :src="`http://localhost:3000${item.url}`"
          :lazy-src="`http://localhost:3000${item.thumbnail_url}`"
        />
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

        <v-btn variant="text" color="error" icon="mdi-delete"> </v-btn>
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
            :disabled="!data?.pagination.totalItems"
          >
          </v-select>
          <div v-if="data?.pagination.totalItems" class="mt-2 ml-2">
            {{ (filters.page - 1) * filters.itemsPerPage + 1 }} of
            {{ data?.pagination.totalItems || '...' }}
          </div>
          <div v-else class="mt-2 ml-2">-</div>
        </div>
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
          @reset="onFiltersReset"
          @close="mediaFormDialog = false"
        ></media-form>
      </div>
    </v-dialog>

    <v-dialog v-model="mediaMassUploadDialog" max-width="1250px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <media-mass-upload
          @reset="onFiltersReset"
          @close="mediaMassUploadDialog = false"
        ></media-mass-upload>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'

const { itemsPerPageDropdown } = useBaseStore()

const mediaMassUploadDialog = ref(false)
const mediaFormDialog = ref(false)
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

  return res.data
}
const queryClient = useQueryClient()

const { isLoading, data } = useQuery({
  queryKey: ['media', filters],
  queryFn: fetchMedia,
  retry: 0,
})

const onFiltersReset = async () => {
  queryClient.resetQueries({ queryKey: ['media'] })
}
</script>

<style lang="scss" scoped></style>
