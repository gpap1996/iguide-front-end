import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBaseStore = defineStore(
  'base',
  () => {
    const globalLoader = ref(false)
    const theme = ref('light')

    return { globalLoader, theme }
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
