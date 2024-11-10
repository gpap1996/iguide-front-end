import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBaseStore = defineStore(
  'base',
  () => {
    const globalLoader = ref(true)
    const theme = ref('light')
    const drawer = ref(true)
    const snackbar = ref({
      show: false,
      text: '',
      color: '',
    })
    return { globalLoader, theme, drawer, snackbar }
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
