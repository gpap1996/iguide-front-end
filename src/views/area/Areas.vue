<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Areas">
      <v-btn @click="areaFormDialog = true" size="x-small" color="primary" icon="mdi-plus"></v-btn>
      <v-text-field
        color="primary"
        append-inner-icon="mdi-magnify"
        maxWidth="300px"
        variant="outlined"
        label="Search Areas"
        clearable
        hide-details
        class="ml-auto"
        density="compact"
      >
      </v-text-field>
    </page-title>

    <v-dialog v-model="areaFormDialog" max-width="1250px" persistent>
      <div class="dialog-wrapper scrollable-dialog">
        <area-form @close="areaFormDialog = false"></area-form>
      </div>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const areaFormDialog = ref(false)
</script>

<style lang="scss" scoped></style>
