<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <div class="px-8 py-4 scrollable flex-grow-1">
      <v-autocomplete
        v-if="filesDropdown.length > 0"
        v-model="form.images"
        :items="filesDropdown"
        item-title="name"
        item-value="id"
        variant="outlined"
        density="comfortable"
        label="Images"
        multiple
        chips
        closable-chips
      >
        <template v-slot:chip="{ props, item }">
          <v-chip
            v-bind="props"
            :prepend-avatar="`${fileUrl + item.raw?.thumbnailPath || ''}`"
            :text="`${item.raw?.name?.slice(0, 10) || ''}...${item.raw?.name?.slice(item.raw?.name?.lastIndexOf('.') || 0) || ''}`"
          ></v-chip>
        </template>

        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="`${fileUrl + item.raw?.thumbnailPath || ''}`"
            :title="item.raw?.name || ''"
          ></v-list-item>
        </template>
      </v-autocomplete>

      <v-alert v-else type="info" color="primary" variant="tonal">
        <div class="d-flex align-center justify-space-between">
          <div>No files are currently available</div>
          <v-btn
            variant="outlined"
            class="text-capitalize"
            @click="$router.push({ name: 'files' })"
          >
            Navigate to files
            <v-icon icon="mdi-chevron-right" class="mt-1"></v-icon>
          </v-btn>
        </div>
      </v-alert>
    </div>
  </v-card>
</template>

<script setup>
import { useAreasStore } from '@/stores/areas'
import { useBaseStore } from '@/stores/base'
import { useFilesStore } from '@/stores/files'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const baseStore = useBaseStore()
const { fileUrl } = baseStore

const areasStore = useAreasStore()
const { form } = storeToRefs(areasStore)

const filesStore = useFilesStore()
const { getFilesDropdown } = filesStore
const { filesDropdown } = storeToRefs(filesStore)

onMounted(async () => {
  if (filesDropdown.value.length === 0) {
    await getFilesDropdown()
  }
})
</script>

<style lang="scss" scoped></style>
