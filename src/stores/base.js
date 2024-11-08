import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useBaseStore = defineStore('base', () => {
  const globalLoader = ref(false)

  return { globalLoader }
})
