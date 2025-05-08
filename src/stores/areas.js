import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAreasStore = defineStore('areas', () => {
  const form = ref({
    weight: 0,
    media: [],
    sound: null,
    parentId: null,
    translations: {},
  })

  async function submitArea() {
    const sanitizedForm = Object.fromEntries(
      Object.entries({ ...form.value }).filter((entry) => entry[1] !== null),
    )
    await axios.post('/areas', sanitizedForm)
  }

  function resetForm() {
    form.value = {
      weight: 0,
      media: [],
      sound: null,
      parentId: null,
      translations: {},
    }
  }

  return { form, submitArea, resetForm }
})
