import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBaseStore = defineStore(
  'base',
  () => {
    const globalLoader = ref(false)
    const theme = ref('light')
    const drawer = ref(true)
    return { globalLoader, theme, drawer }
  },
  {
    persist: [
      {
        pick: ['theme'],
        storage: localStorage,
      },
    ],
  },
)
