import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const useAreasStore = defineStore('areas', () => {
  const form = ref({
    weight: null,
    media: [],
    sound: null,
    translations: {},
  })

  async function submitArea() {
    const sanitizedForm = Object.fromEntries(
      Object.entries({ ...form.value }).filter((entry) => entry[1] !== null),
    )
    await axios.post('/areas', sanitizedForm)
  }

  return { form, submitArea }
})
