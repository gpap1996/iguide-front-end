import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useExternalFilesStore = defineStore('externalFiles', () => {
  const externalFilesDropdown = ref([])

  const dropdownVideos = computed(() => {
    return externalFilesDropdown.value.filter((file) => file.type === 'video')
  })

  const dropdownModels = computed(() => {
    return externalFilesDropdown.value.filter((file) => file.type === 'model')
  })

  async function getExternalFilesDropdown() {
    try {
      const res = await axios.get(`/external-files/dropdown`)
      externalFilesDropdown.value = res.data?.items
    } catch (e) {
      console.log(e)
    }
  }

  return { externalFilesDropdown, getExternalFilesDropdown, dropdownVideos, dropdownModels }
})
