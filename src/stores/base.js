import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useBaseStore = defineStore(
  'base',
  () => {
    const globalLoader = ref(true)
    const theme = ref('light')
    const drawer = ref(true)
    const currentLanguage = ref('el')
    const snackbar = ref({
      show: false,
      text: '',
      color: '',
      icon: '',
    })

    const languages = ref([])
    const getLanguages = async () => {
      try {
        const res = await axios.get(`/languages`)
        languages.value = res.data?.languages
      } catch (e) {
        console.log(e)
      }
    }

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
    return {
      globalLoader,
      theme,
      drawer,
      snackbar,
      itemsPerPageDropdown,
      languages,
      getLanguages,
      currentLanguage,
    }
  },
  {
    persist: [
      {
        pick: ['theme', 'currentLanguage'],
        storage: localStorage,
      },
    ],
  },
)
