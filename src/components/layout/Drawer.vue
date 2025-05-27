<template>
  <v-navigation-drawer
    v-if="$route.path != '/login'"
    :rail="!isMobile"
    :expand-on-hover="!isMobile"
    v-model="drawer"
    width="300"
    disable-resize-watcher
  >
    <v-list>
      <v-list-item
        prepend-icon="mdi-account"
        :title="user?.firstName + ' ' + user?.lastName"
        :subtitle="user?.email"
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

    <template v-slot:append>
      <v-divider></v-divider>
      <v-list class="d-flex align-center justify-center">
        <v-list-item :title="`${user?.project?.name} © ${new Date().getFullYear()}`"></v-list-item>
      </v-list>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const { isAdmin, isManager, user } = authStore

onMounted(() => {
  if (isAdmin) {
    navigation.value.push(
      {
        icon: 'mdi-clipboard-text-multiple',
        title: 'Projects',
        path: '/projects',
      },
      {
        icon: 'mdi-account-multiple',
        title: 'Users',
        path: '/users',
      },
    )
  } else if (isManager)
    navigation.value.push(
      {
        icon: 'mdi-view-dashboard',
        title: 'Dashboard',
        path: '/dashboard',
      },
      {
        icon: 'mdi-image-area',
        title: 'Areas',
        path: '/areas',
      },

      {
        icon: 'mdi-folder',
        title: 'Files',
        path: '/files',
      },
      {
        icon: 'mdi-link',
        title: 'External Files',
        path: '/external-files',
      },

      {
        icon: 'mdi-translate',
        title: 'Languages',
        path: '/languages',
      },
    )
})
const { drawer } = storeToRefs(useBaseStore())

const navigation = ref([])

const { mdAndDown } = useDisplay()
const isMobile = computed(() => mdAndDown.value)

watch(
  () => mdAndDown.value,
  (newValue) => {
    if (newValue) {
      drawer.value = false
    } else {
      drawer.value = true
    }
  },
  { immediate: true },
)
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
