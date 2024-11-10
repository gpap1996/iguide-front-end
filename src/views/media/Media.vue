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
      >
      </v-text-field>
    </page-title>
    <pre>
      {{ media }}
    </pre>

    <v-dialog v-model="mediaFormDialog" max-width="1250px">
      <div class="dialog-wrapper scrollable-dialog">
        <media-form @close="mediaFormDialog = false"></media-form>
      </div>
    </v-dialog>

    <v-dialog v-model="mediaMassUploadDialog" max-width="1250px">
      <div class="dialog-wrapper scrollable-dialog">
        <media-mass-upload @close="mediaMassUploadDialog = false"></media-mass-upload>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import axios from 'axios'
import { onMounted, ref } from 'vue'
onMounted(async () => {
  await fetchMedia()
})

const media = ref([])
const mediaMassUploadDialog = ref(false)
const mediaFormDialog = ref(false)

const fetchMedia = async () => {
  const res = await axios.get('/media')
  media.value = res.data
}
</script>

<style lang="scss" scoped></style>
