<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title :title="$t('projects.title')">
      <v-btn-group variant="outlined" class="mr-3" density="comfortable">
        <v-btn
          @click="onOpenProjectFormDialog(null)"
          color="primary"
          icon="mdi-plus"
          class="mr-2"
          v-tooltip="$t('projects.create')"
        ></v-btn>
      </v-btn-group>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        :label="$t('projects.search')"
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
      :items="data?.projects"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
    >
      <template v-slot:[`item.logo`]="{ item }">
        <v-avatar size="40">
          <v-img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name"></v-img>
          <v-icon v-else icon="mdi-folder-image" size="large"></v-icon>
        </v-avatar>
      </template>
      <template v-slot:[`item.status`]="{ item }">
        <v-icon
          :color="item.status ? 'success' : 'error'"
          :icon="item.status ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
        ></v-icon>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          class="mr-4"
          icon="mdi-pencil"
          v-tooltip="$t('projects.edit')"
          @click="onOpenProjectFormDialog(item)"
        >
        </v-btn>
      </template>
      <!-- table footer -->
      <template v-slot:bottom>
        <v-divider></v-divider>
        <div class="d-flex ml-auto mr-10 mt-6">
          <div class="mt-2 mr-2">{{ $t('common.itemsPerPage') }}</div>
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

    <v-dialog v-model="projectFormDialog.open" max-width="700px" max-height="800px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <project-form
          :project="projectFormDialog.project"
          @reset="onFiltersReset('project')"
          @close="onCloseProjectFormDialog"
        ></project-form>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { debounce } from 'lodash'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const baseStore = useBaseStore()
const { itemsPerPageDropdown } = baseStore
const projectFormDialog = ref({
  open: false,
  project: null,
})

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const headers = computed(() => [
  {
    title: t('projects.logo'),
    key: 'logo',
    sortable: false,
    width: '80px', // Adjust width as needed
  },
  {
    title: t('projects.name'),
    key: 'name',
    sortable: false,
  },

  {
    title: t('projects.description'),
    key: 'description',
    sortable: false,
  },

  {
    title: t('projects.status'),
    key: 'status',
    sortable: false,
  },
  {
    title: t('common.actions'),
    key: 'actions',
    align: 'start',
    sortable: false,
  },
])

const fetchProjects = async () => {
  const res = await axios.get('/projects', {
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
  queryKey: ['project', filters],
  queryFn: fetchProjects,
  retry: 0,
})

const onFiltersReset = async () => {
  projectFormDialog.value = false

  await queryClient.resetQueries({ queryKey: ['project'] })
}

const updateFilters = debounce((value) => {
  filters.value = {
    ...filters.value,
    title: value,
    page: 1,
  }
}, 300)

async function onCloseProjectFormDialog() {
  projectFormDialog.value = {
    open: false,
    project: null,
  }
}

async function onOpenProjectFormDialog(project) {
  projectFormDialog.value = {
    open: true,
    project: project || null,
  }
}
</script>

<style lang="scss" scoped></style>
