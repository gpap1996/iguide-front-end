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

    const itemsPerPageDropdown = [
      {
        label: '10',
        value: 10,
      },

      {
        label: '25',
        value: 25,
      },

      {
        label: '50',
        value: 50,
      },

      {
        label: 'All',
        value: -1,
      },
    ]
    return { globalLoader, theme, drawer, snackbar, itemsPerPageDropdown }
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
