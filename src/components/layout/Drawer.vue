<template>
  <v-navigation-drawer
    v-if="$route.path != '/login'"
    :rail="!isMobile"
    :expand-on-hover="!isMobile"
    v-model="drawer"
    width="300"
  >
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
        active-class="active-item"
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
import { computed, ref } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
const { drawer } = storeToRefs(useBaseStore())
const navigation = ref([
  {
    icon: 'mdi-home',
    title: 'Home',
    path: '/home',
  },
  {
    icon: 'mdi-image-area',
    title: 'Areas',
    path: '/areas',
  },
])

const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)
</script>

<style lang="scss" scoped>
.active-item::before {
  content: '';
  position: absolute;
  left: 1px;
  height: 25px;
  border-radius: 10px;
  border-left: 3.5px solid rgb(var(--v-theme-primary));
}
</style>
