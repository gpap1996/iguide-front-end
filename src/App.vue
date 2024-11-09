<template>
  <v-layout
    v-motion
    :initial="{
      opacity: 0,
      transition: {
        duration: 500,
      },
    }"
    :enter="{
      opacity: 1,
      transition: {
        duration: 500,
      },
    }"
  >
    <appbar v-if="route.path != '/'" />
    <drawer v-if="route.path != '/'" />
    <v-main>
      <RouterView
        v-motion
        :initial="{
          opacity: 0,
          transition: {
            duration: 500,
          },
        }"
        :enter="{
          opacity: 1,
          transition: {
            duration: 500,
          },
        }"
      />
    </v-main>
  </v-layout>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useBaseStore } from './stores/base'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'

const { theme } = storeToRefs(useBaseStore())
const vuetifyTheme = useTheme()
const route = useRoute()
onBeforeMount(async () => {
  vuetifyTheme.global.name.value = theme.value === 'light' ? 'light' : 'dark'
})
</script>

<style></style>
