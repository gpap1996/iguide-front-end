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

      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        location="bottom right"
      >
        <div class="d-flex align-center">
          <div class="mr-2">
            {{ snackbar.text }}
          </div>
          <v-icon :icon="snackbar.icon" class="ml-auto" color="white"> </v-icon>
        </div>
      </v-snackbar>
    </v-main>
  </v-layout>
</template>

<script setup>
import { onBeforeMount } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useBaseStore } from './stores/base'
import { useTheme } from 'vuetify'
import { storeToRefs } from 'pinia'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const { isManager } = authStore
const { role } = storeToRefs(authStore)

const baseStore = useBaseStore()
const { getLanguages } = baseStore
const { theme, snackbar } = storeToRefs(baseStore)

const vuetifyTheme = useTheme()
const route = useRoute()
onBeforeMount(async () => {
  vuetifyTheme.global.name.value = theme.value === 'light' ? 'light' : 'dark'
  if (role.value && isManager) await getLanguages()
})
</script>

<style></style>
