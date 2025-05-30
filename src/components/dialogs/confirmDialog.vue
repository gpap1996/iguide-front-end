<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ title }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 flex-grow-1">
      <slot> </slot>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        :text="cancelText || $t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        :text="confirmText || $t('common.save')"
        variant="flat"
        @click="$emit('confirm')"
        :loading="isLoading"
        :disabled="isLoading"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
defineProps({
  title: String,
  isLoading: Boolean,
  confirmText: String,
  cancelText: String,
})

defineEmits(['close', 'confirm'])
</script>

<style lang="scss" scoped></style>
