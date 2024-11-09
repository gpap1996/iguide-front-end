<template>
  <div class="flex-grow-1 d-flex flex-column pa-8 bg-background">
    <div class="d-flex mb-4">
      <v-btn @click="$emit('close')" class="mr-4" color="primary" icon="mdi-close"></v-btn>

      <div class="title">Create New Area</div>
    </div>

    <v-card class="pa-8">
      <v-tabs v-model="tab">
        <v-tab value="Basic Information">Basic Information</v-tab>
        <v-tab value="Media">Media</v-tab>
      </v-tabs>

      <v-tabs-window v-model="tab" class="mt-8">
        <v-tabs-window-item value="Basic Information">
          <area-basic-information />
        </v-tabs-window-item>

        <v-tabs-window-item value="Media"> Media </v-tabs-window-item>
      </v-tabs-window>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const tab = ref(null)
</script>

<style lang="scss" scoped></style>
