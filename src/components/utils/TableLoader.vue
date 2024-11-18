<template>
  <div class="d-flex align-start justify-start" v-for="n in 10" :key="n">
    <v-skeleton-loader
      v-for="item in headers.length"
      class="flex-grow-1"
      type="subtitle"
      :key="item.key"
    ></v-skeleton-loader>
  </div>
</template>

<script setup>
defineProps({
  headers: Array,
})
</script>

<style lang="scss" scoped></style>
