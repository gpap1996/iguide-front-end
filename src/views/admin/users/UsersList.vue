<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title :title="$t('users.title')">
      <v-btn-group variant="outlined" class="mr-3" density="comfortable">
        <v-btn
          @click="onOpenUserFormDialog(null)"
          color="primary"
          icon="mdi-plus"
          class="mr-2"
          v-tooltip="$t('users.create')"
        ></v-btn>
      </v-btn-group>

      <v-autocomplete
        clearable
        hide-details
        :label="$t('users.projects')"
        variant="outlined"
        item-title="name"
        item-value="id"
        density="compact"
        @update:model-value="
          (projectId) => {
            filters = {
              ...filters,
              projectId,
              page: 1,
            }
          }
        "
        :items="projects"
        max-width="250px"
      ></v-autocomplete>
    </page-title>

    <v-data-table-server
      :headers="headers"
      :items="data?.users"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
    >
      <template v-slot:[`item.fullName`]="{ item }">
        <div>{{ item.firstName }} {{ item.lastName }}</div>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          class="mr-4"
          icon="mdi-pencil"
          v-tooltip="$t('users.edit')"
          @click="onOpenUserFormDialog(item)"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(currentUser = item), (userDeleteDialog = true)"
          v-tooltip="$t('users.delete')"
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
    <v-dialog v-model="userFormDialog.open" max-width="700px" max-height="800px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <user-form
          :projects="projects"
          :user="userFormDialog.user"
          @reset="onFiltersReset('user')"
          @close="onCloseUserFormDialog"
        ></user-form>
      </div>
    </v-dialog>

    <v-dialog v-model="userDeleteDialog" max-width="500px">
      <confirm-dialog
        :title="$t('users.deleteTitle')"
        :isLoading="isDeleteLoading"
        @close="(userDeleteDialog = false), (currentUser = null)"
        @confirm="onDeleteUser"
      >
        {{ $t('users.deleteConfirm') }}
      </confirm-dialog>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

onMounted(async () => {
  const res = await axios.get('/projects')
  projects.value = res.data.projects
})

const baseStore = useBaseStore()
const { itemsPerPageDropdown } = baseStore

const projects = ref([])
const userFormDialog = ref({
  open: false,
  user: null,
})
const userDeleteDialog = ref(false)
const isDeleteLoading = ref(false)
const currentUser = ref(null)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  projectId: null,
})

const headers = computed(() => [
  {
    title: t('users.fullName'),
    key: 'fullName',
    sortable: false,
  },

  {
    title: t('users.email'),
    key: 'email',
    sortable: false,
  },

  {
    title: t('users.project'),
    key: 'project.name',
    sortable: false,
  },

  {
    title: t('common.actions'),
    key: 'actions',
    align: 'start',
    sortable: false,
  },
])

const fetchUsers = async () => {
  const res = await axios.get('/users', {
    params: {
      limit: filters.value.itemsPerPage,
      page: filters.value.page,
      projectId: filters.value.projectId,
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
  queryKey: ['user', filters],
  queryFn: fetchUsers,
  retry: 0,
})

const onFiltersReset = async () => {
  userFormDialog.value.open = false

  await queryClient.resetQueries({ queryKey: ['user'] })
}

async function onCloseUserFormDialog() {
  userFormDialog.value = {
    open: false,
    user: null,
  }
}

async function onOpenUserFormDialog(user) {
  userFormDialog.value = {
    open: true,
    user: user || null,
  }
}

const onDeleteUser = async () => {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/users/${currentUser.value.id}`)
    userDeleteDialog.value = false

    // If this was the last item on page (except page 1), go back to page 1
    if (data.value?.users?.length === 1 && filters.value.page > 1) {
      filters.value = {
        ...filters.value,
        page: 1,
      }
    } else {
      await onFiltersReset()
    }

    baseStore.snackbar = {
      show: true,
      text: t('users.deleteSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
    baseStore.snackbar = {
      show: true,
      text: error.response?.data?.message || t('common.error'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isDeleteLoading.value = false
    currentUser.value = null
  }
}
</script>

<style lang="scss" scoped></style>
