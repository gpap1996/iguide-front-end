import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useFilesStore = defineStore('files', () => {
  const filesDropdown = ref([])

  const dropdownImages = computed(() => {
    return filesDropdown.value.filter((file) => file.type === 'image')
  })

  const dropdownAudio = computed(() => {
    return filesDropdown.value.filter((file) => file.type === 'audio')
  })

  async function getFilesDropdown() {
    try {
      const res = await axios.get(`/files/dropdown`)
      filesDropdown.value = res.data?.items
    } catch (e) {
      console.log(e)
    }
  }

  return { filesDropdown, getFilesDropdown, dropdownImages, dropdownAudio }
})
