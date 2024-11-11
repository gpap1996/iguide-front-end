<template>
  <div class="image-wrapper rounded overflow-hidden mb-2">
    <v-skeleton-loader type="image" class="image-loader" v-if="!imageLoaded" />

    <v-img cover :aspect-ratio="16 / 9" class="image" @load="onImageLoad" alt="image" :src="url" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  url: String,
})

const imageLoaded = ref(false)

const onImageLoad = () => {
  console.log('??')
  imageLoaded.value = true
}
</script>

<style lang="scss" scoped>
.image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;

  .image-loader {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;

    :deep(.v-skeleton-loader__image) {
      height: 100% !important;
    }
  }

  .image {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
}
</style>
