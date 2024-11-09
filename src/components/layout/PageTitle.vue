<template>
  <div class="d-flex flex-column">
    <div class="d-flex mb-4 align-center">
      <div class="title mr-4">{{ title }}</div>
      <slot></slot>
    </div>
    <v-divider></v-divider>
  </div>
</template>

<script setup>
const { title } = defineProps({
  title: String,
})
</script>

<style lang="scss" scoped></style>
