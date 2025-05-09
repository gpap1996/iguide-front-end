import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useMediaStore = defineStore('media', () => {
  const mediaDropdown = ref([])

  async function getMediaDropdown() {
    try {
      const res = await axios.get(`/media/dropdown`)
      mediaDropdown.value = res.data?.items
    } catch (e) {
      console.log(e)
    }
  }

  return { mediaDropdown, getMediaDropdown }
})
