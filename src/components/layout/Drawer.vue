<template>
  <v-navigation-drawer v-model="drawer" width="300">
    <v-list>
      <v-list-item
        prepend-icon="mdi-account"
        title="Giorgos Papapanos"
        subtitle="g.papapanos1996@gmail.com"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        color="primary"
        link
        v-for="item in navigation"
        :key="item.title"
        :prepend-icon="item.icon"
        :title="item.title"
        :to="item.path"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

const { drawer } = storeToRefs(useBaseStore())
const navigation = ref([
  {
    icon: 'mdi-home',
    title: 'Home',
    path: '/',
  },
  {
    icon: 'mdi-image-area',
    title: 'Areas',
    path: '/areas',
  },
])
</script>

<style lang="scss" scoped></style>
