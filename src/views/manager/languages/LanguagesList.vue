<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title :title="$t('languages.title')">
      <v-btn
        @click="languageFormDialog = true"
        color="primary"
        icon="mdi-plus"
        v-tooltip="$t('languages.create')"
        variant="outlined"
        density="comfortable"
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
      <template v-slot:[`item.path`]="{ item }">
        <v-img
          v-if="item.type == 'image'"
          width="100px"
          height="67px"
          cover
          class="my-4 rounded-xl"
          alt="image"
          :src="`${fileUrl + item.path}`"
          :lazy-src="`${fileUrl + item.thumbnailPath}`"
        />
        <span v-else> - </span>
      </template>

      <template v-slot:[`item.title`]="{ item }">
        <span v-if="item.title">
          {{ item.title }}
        </span>
        <span v-else> - </span>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          class="mr-4"
          icon="mdi-pencil"
          v-tooltip="$t('languages.edit')"
          @click="(currentLanguage = item), (languageFormDialog = true)"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          v-tooltip="$t('languages.delete')"
          @click="(currentLanguage = item), (languageDeleteDialog = true)"
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

    <v-dialog v-model="languageFormDialog" max-width="700px" max-height="400px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <language-form
          :language="currentLanguage"
          @reset="onFiltersReset('language')"
          @close="languageFormDialog = false"
        ></language-form>
      </div>
    </v-dialog>

    <v-dialog v-model="languageDeleteDialog" max-width="600px" max-height="500px">
      <div class="dialog-wrapper scrollable-dialog">
        <strict-confirm-dialog
          :title="$t('languages.deleteTitle')"
          :entity-name="currentLanguage?.name || ''"
          :warning-message="$t('languages.deleteWarning')"
          :confirm-text="$t('languages.deleteConfirmText')"
          :placeholder="$t('languages.deleteTypePlaceholder')"
          :expected-input="currentLanguage?.name || ''"
          :invalid-input-message="$t('languages.deleteInvalidInput')"
          :is-loading="isDeleteLoading"
          @close="(languageDeleteDialog = false), (currentLanguage = null)"
          @confirm="onDeleteLanguage"
        ></strict-confirm-dialog>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref, computed } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useBaseStore } from '@/stores/base'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const baseStore = useBaseStore()
const { itemsPerPageDropdown, fileUrl } = baseStore
const { snackbar } = storeToRefs(baseStore)

const languageFormDialog = ref(false)
const languageDeleteDialog = ref(false)
const currentLanguage = ref(null)
const isDeleteLoading = ref(false)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const headers = computed(() => [
  {
    title: t('languages.name'),
    key: 'name',
    sortable: false,
  },
  {
    title: t('languages.locale'),
    key: 'locale',
    sortable: false,
  },
  {
    title: t('common.actions'),
    key: 'actions',
    align: 'start',
    sortable: false,
  },
])

const fetchLanguages = async () => {
  const res = await axios.get('/languages', {
    params: {
      limit: filters.value.itemsPerPage,
      page: filters.value.page,
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
  queryKey: ['language', filters],
  queryFn: fetchLanguages,
  retry: 0,
})

const onFiltersReset = async () => {
  languageFormDialog.value = false

  await queryClient.resetQueries({ queryKey: ['language'] })
}

const onDeleteLanguage = async () => {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/languages/${currentLanguage.value.id}`)
    languageDeleteDialog.value = false

    // If this was the last item on page (except page 1), go back to page 1
    if (data.value?.languages?.length === 1 && filters.value.page > 1) {
      filters.value = {
        ...filters.value,
        page: 1,
      }
    } else {
      await onFiltersReset()
    }

    snackbar.value = {
      show: true,
      text: t('languages.deleteSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
    snackbar.value = {
      show: true,
      text: error.response?.data?.message || t('common.error'),
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isDeleteLoading.value = false
    currentLanguage.value = null
  }
}
</script>

<style lang="scss" scoped></style>
