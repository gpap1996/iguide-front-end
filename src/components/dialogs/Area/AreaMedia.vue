<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <div class="px-8 py-4 scrollable flex-grow-1">
      <v-autocomplete
        v-model="form.media"
        :items="mediaDropdown"
        item-title="fileName"
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
            :prepend-avatar="`http://localhost:3000${item.raw.thumbnailUrl}`"
            :text="item.raw.fileName"
          ></v-chip>
        </template>

        <template v-slot:item="{ props, item }">
          <v-list-item
            v-bind="props"
            :prepend-avatar="`http://localhost:3000${item.raw.thumbnailUrl}`"
            :title="item.raw.fileName"
          ></v-list-item>
        </template>
      </v-autocomplete>
    </div>
  </v-card>
</template>

<script setup>
import { useAreasStore } from '@/stores/areas'
import { useMediaStore } from '@/stores/media'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const areasStore = useAreasStore()
const { form } = storeToRefs(areasStore)

const mediaStore = useMediaStore()
const { getMediaDropdown } = mediaStore
const { mediaDropdown } = storeToRefs(mediaStore)

onMounted(async () => {
  if (mediaDropdown.value.length) return
  await getMediaDropdown()
})
</script>

<style lang="scss" scoped></style>
