<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <div class="px-8 py-4 scrollable flex-grow-1">
      <v-card>
        <v-card-title>{{ $t('areas.files') }}</v-card-title>
        <v-alert v-if="filesDropdown.length === 0" type="info" color="primary" variant="tonal">
          <div class="d-flex align-center justify-space-between">
            <div>{{ $t('files.noFiles') }}</div>
            <v-btn
              variant="outlined"
              class="text-capitalize"
              @click="$router.push({ name: 'files' })"
            >
              {{ $t('files.navigateToFiles') }}
              <v-icon icon="mdi-chevron-right" class="mt-1"></v-icon>
            </v-btn>
          </div>
        </v-alert>

        <v-card-text v-else>
          <v-autocomplete
            v-model="form.images"
            :items="dropdownImages"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :label="$t('files.images')"
            multiple
            chips
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :prepend-avatar="`${item.raw?.thumbnailUrl || ''}`"
                :text="item.raw?.name || ''"
              ></v-chip>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                :prepend-avatar="`${item.raw?.thumbnailUrl || ''}`"
                :title="item.raw?.name || ''"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <v-autocomplete
            v-model="form.audio"
            :items="dropdownAudio"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :label="$t('files.audio')"
            multiple
            chips
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :prepend-icon="`mdi-music-circle`"
                :text="item.raw?.name || ''"
              ></v-chip>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-music-circle"
                :title="item.raw?.name || ''"
              ></v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
      </v-card>

      <v-card class="mt-8">
        <v-card-title>{{ $t('areas.externalFiles') }}</v-card-title>
        <v-alert
          v-if="externalFilesDropdown.length === 0"
          type="info"
          color="primary"
          variant="tonal"
        >
          <div class="d-flex align-center justify-space-between">
            <div>{{ $t('files.noExternalFiles') }}</div>
            <v-btn
              variant="outlined"
              class="text-capitalize"
              @click="$router.push({ name: 'external-files' })"
            >
              {{ $t('files.navigateToFiles') }}
              <v-icon icon="mdi-chevron-right" class="mt-1"></v-icon>
            </v-btn>
          </div>
        </v-alert>

        <v-card-text v-else>
          <v-autocomplete
            v-model="form.videos"
            :items="dropdownVideos"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :label="$t('files.videos')"
            multiple
            chips
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :prepend-icon="`mdi-video`"
                :text="item.raw?.name || ''"
              ></v-chip>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-video"
                :title="item.raw?.name || ''"
              ></v-list-item>
            </template>
          </v-autocomplete>

          <v-autocomplete
            v-model="form.models"
            :items="dropdownModels"
            item-title="name"
            item-value="id"
            variant="outlined"
            density="comfortable"
            :label="$t('files.models')"
            multiple
            chips
            closable-chips
          >
            <template v-slot:chip="{ props, item }">
              <v-chip
                v-bind="props"
                :prepend-icon="`mdi-cube`"
                :text="item.raw?.name || ''"
              ></v-chip>
            </template>

            <template v-slot:item="{ props, item }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-cube"
                :title="item.raw?.name || ''"
              ></v-list-item>
            </template>
          </v-autocomplete>
        </v-card-text>
      </v-card>
    </div>
  </v-card>
</template>

<script setup>
import { useAreasStore } from '@/stores/areas'
import { useExternalFilesStore } from '@/stores/externalFiles'
import { useFilesStore } from '@/stores/files'
import { storeToRefs } from 'pinia'

const areasStore = useAreasStore()
const { form } = storeToRefs(areasStore)

const filesStore = useFilesStore()

const { dropdownImages, dropdownAudio, filesDropdown } = storeToRefs(filesStore)

const externalFilesStore = useExternalFilesStore()

const { dropdownVideos, dropdownModels, externalFilesDropdown } = storeToRefs(externalFilesStore)
</script>

<style lang="scss" scoped></style>
