<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Languages">
      <v-btn
        @click="languageFormDialog = true"
        size="x-small"
        color="primary"
        icon="mdi-plus"
        class="mr-2"
      ></v-btn>
    </page-title>

    <v-data-table-server
      :headers="headers"
      :items="data?.languages"
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
          :lazy-src="`http://localhost:3000${item.thumbnail_url}`"
        />
        <span v-else> - </span>
      </template>

      <template v-slot:[`item.title`]="{ item }">
        <span v-if="item.title">
          {{ item.title }}
        </span>
        <span v-else> - </span>
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
          @click="(currentLanguage = item), (languageFormDialog = true)"
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

    <v-dialog v-model="languageFormDialog" max-width="700px" max-height="400px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <language-form
          :language="currentLanguage"
          @reset="onFiltersReset('language')"
          @close="languageFormDialog = false"
        ></language-form>
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

const languageFormDialog = ref(false)
const currentLanguage = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const headers = [
  {
    title: 'Name',
    key: 'name',
    sortable: false,
  },
  {
    title: 'Code',
    key: 'code',

    sortable: false,
  },

  {
    title: 'Actions',
    key: 'actions',
    align: 'start',
    sortable: false,
  },
]

const fetchLanguages = async () => {
  const res = await axios.get('/language', {})

  return res.data
}
const queryClient = useQueryClient()

const { isLoading, data } = useQuery({
  queryKey: ['language', filters],
  queryFn: fetchLanguages,
  retry: 0,
})

const onFiltersReset = async () => {
  languageFormDialog.value = false

  await queryClient.resetQueries({ queryKey: ['language'] })
}
</script>

<style lang="scss" scoped></style>
