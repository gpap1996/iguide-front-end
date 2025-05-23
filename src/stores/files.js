import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useFilesStore = defineStore('files', () => {
  const filesDropdown = ref([])

  async function getFilesDropdown() {
    try {
      const res = await axios.get(`/files/dropdown`)
      filesDropdown.value = res.data?.items
    } catch (e) {
      console.log(e)
    }
  }

  return { filesDropdown, getFilesDropdown }
})
