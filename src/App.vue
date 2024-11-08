<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <Appbar v-if="$route.path != '/login'" />
    <v-main>
      <RouterView />
    </v-main>
    <!-- <BottomNavigation v-if="$route.path != '/areas' && !loader" /> -->
  </v-app>
</template>

<style scoped></style>
