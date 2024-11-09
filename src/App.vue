<template>
  <v-layout>
    <appbar v-if="$route.path != '/login'" />
    <drawer v-if="$route.path != '/login'" />

    <v-main>
      <RouterView />
    </v-main>
    <!-- <BottomNavigation v-if="$route.path != '/areas' && !loader" /> -->
  </v-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useBaseStore } from './stores/base'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'

const { theme } = storeToRefs(useBaseStore())
const vuetifyTheme = useTheme()

onMounted(() => {
  vuetifyTheme.global.name.value = theme.value === 'light' ? 'light' : 'dark'
})
</script>

<style></style>
