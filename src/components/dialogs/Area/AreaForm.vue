<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">Create Area</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <v-tabs v-model="tab" :show-arrows="true" class="mt-4 px-4" color="primary">
      <v-tab value="Basic Information">Basic Information</v-tab>
      <v-tab value="Media">Media</v-tab>
    </v-tabs>

    <v-tabs-window v-model="tab" class="mt-8" id="single-user-tabs">
      <v-tabs-window-item value="Basic Information">
        <area-basic-information />
      </v-tabs-window-item>

      <v-tabs-window-item value="Media"> Media </v-tabs-window-item>
    </v-tabs-window>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn variant="outlined" text="Close" @click="$emit('close')" class="mr-2"></v-btn>
      <v-btn color="primary" text="Save" variant="flat" @click="$emit('close')"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref(null)
</script>

<style lang="scss" scoped></style>
