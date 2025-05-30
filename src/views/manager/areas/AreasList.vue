<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title :title="$t('areas.title')">
      <v-btn
        @click="onOpenAreaFormDialog(null)"
        color="primary"
        icon="mdi-plus"
        v-tooltip="$t('areas.create')"
        class="mr-auto"
        variant="outlined"
        density="comfortable"
      ></v-btn>

      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        :label="$t('areas.search')"
        clearable
        hide-details
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
      :items="data?.areas"
      :items-length="data?.pagination?.totalItems || 0"
      item-value="id"
      :loading="isLoading"
      class="mx-auto mt-4"
      style="max-width: 90vw; flex-grow: 1"
    >
      <template v-slot:[`item.title`]="{ item }">
        <div
          class="d-flex align-center mb-2 mt-2"
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

          <div v-if="tr.title" :class="{ 'font-weight-bold': tr.language.locale == 'el' }">
            {{ tr.title }}
          </div>
        </div>
        <div v-if="item.translations.length == 0">
          <div class="font-weight-bold">-</div>
        </div>
      </template>

      <template v-slot:[`item.subtitle`]="{ item }">
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

          <div v-if="tr.subtitle" :class="{ 'font-weight-bold': tr.language.locale == 'el' }">
            {{ tr.subtitle }}
          </div>
        </div>
        <div v-if="item.translations.length == 0">
          <div class="font-weight-bold">-</div>
        </div>
      </template>

      <template v-slot:[`item.parent`]="{ item }">
        <div
          class="d-flex align-center"
          v-for="tr in item?.parent?.translations"
          :key="tr.language.locale"
        >
          <div v-if="tr.language.locale == 'el'">
            {{ tr.title }}
          </div>
        </div>
        <div v-if="!item.parent?.translations">
          <div class="font-weight-bold">-</div>
        </div>
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn
          variant="text"
          class="mr-4"
          icon="mdi-pencil"
          @click="onOpenAreaFormDialog(item.id)"
          v-tooltip="$t('areas.edit')"
        >
        </v-btn>

        <v-btn
          variant="text"
          color="error"
          icon="mdi-delete"
          @click="(form = item), (areasDeleteDialog = true)"
          v-tooltip="$t('areas.delete')"
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

    <v-dialog v-model="areaFormDialog.open" max-width="800px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <area-form
          @reset="onFiltersReset('save')"
          @close="onCloseAreaFormDialog"
          :areaId="areaFormDialog.areaId"
        ></area-form>
      </div>
    </v-dialog>

    <v-dialog v-model="areasDeleteDialog" max-width="600px" max-height="500px">
      <div class="dialog-wrapper scrollable-dialog">
        <strict-confirm-dialog
          :title="$t('areas.deleteTitle')"
          :entity-name="getAreaName(form)"
          :warning-message="$t('areas.deleteWarning')"
          :confirm-text="$t('areas.deleteConfirmText')"
          :placeholder="$t('areas.deleteTypePlaceholder')"
          :expected-input="getAreaName(form)"
          :invalid-input-message="$t('areas.deleteInvalidInput')"
          :is-loading="isDeleteLoading"
          @close="(areasDeleteDialog = false), (form = null)"
          @confirm="onDeleteArea"
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
import { debounce } from 'lodash'
import { useAreasStore } from '@/stores/areas'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const baseStore = useBaseStore()
const { itemsPerPageDropdown } = baseStore
const { snackbar } = storeToRefs(baseStore)

const { t } = useI18n()

const areaFormDialog = ref({
  open: false,
  areaId: null,
})
const areasDeleteDialog = ref(false)
const isDeleteLoading = ref(false)

const areasStore = useAreasStore()
const { resetForm } = areasStore
const { form, isEdit } = storeToRefs(areasStore)

const filters = ref({
  page: 1,
  itemsPerPage: 10,
  title: null,
})

const headers = computed(() => [
  {
    title: t('areas.title'),
    key: 'title',
    sortable: false,
  },
  {
    title: t('areas.subtitle'),
    key: 'subtitle',
    sortable: false,
  },
  {
    title: t('areas.widerArea'),
    key: 'parent',
    sortable: false,
  },
  {
    title: t('areas.weight'),
    key: 'weight',
    sortable: false,
  },
  {
    title: t('common.actions'),
    key: 'actions',
    align: 'start',
    sortable: false,
  },
])

async function fetchAreas() {
  const res = await axios.get('/areas', {
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
  queryKey: ['areas', filters],
  queryFn: fetchAreas,
  retry: 0,
})

async function onFiltersReset() {
  await queryClient.resetQueries({ queryKey: ['areas'] })
  onCloseAreaFormDialog()
  resetForm()
}

// Debounced function for updating filters
const updateFilters = debounce((value) => {
  filters.value = {
    ...filters.value,
    title: value,
    page: 1,
  }
}, 300)

async function onOpenAreaFormDialog(areaId) {
  areaFormDialog.value = {
    open: true,
    areaId,
  }
  if (areaId) isEdit.value = true
  else isEdit.value = false
}

async function onCloseAreaFormDialog() {
  areaFormDialog.value = {
    open: false,
    areaId: null,
  }
  resetForm()
}

async function onDeleteArea() {
  isDeleteLoading.value = true
  try {
    await axios.delete(`/areas/${form.value.id}`)
    areasDeleteDialog.value = false
    if (data.value?.areas?.length == 1 && filters.value.page > 1)
      filters.value = {
        ...filters.value,
        title: null,
        page: 1,
      }
    else await onFiltersReset()

    snackbar.value = {
      show: true,
      text: t('areas.deleteSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    console.log(error)
  } finally {
    isDeleteLoading.value = false
  }
}

function getAreaName(area) {
  // Get area name from translations, preferring Greek (el) then English (en)
  if (!area?.translations || area.translations.length === 0) return ''

  // First try to find Greek translation
  const greekTranslation = area.translations.find((t) => t.language?.locale === 'el')
  if (greekTranslation?.title) return greekTranslation.title

  // Then try English translation
  const englishTranslation = area.translations.find((t) => t.language?.locale === 'en')
  if (englishTranslation?.title) return englishTranslation.title

  // Finally, use the first available translation
  const firstTranslation = area.translations.find((t) => t.title)
  return firstTranslation?.title || ''
}
</script>

<style lang="scss" scoped></style>
