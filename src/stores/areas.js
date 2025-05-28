import { ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'

export const useAreasStore = defineStore('areas', () => {
  // Get languages from baseStore
  const baseStore = useBaseStore()
  const { languages } = storeToRefs(baseStore)
  const isEdit = ref(false)
  const areas = ref([])

  const form = ref({
    weight: 0,
    images: [],
    audio: [],
    videos: [],
    models: [],
    parentId: null,
    translations: {},
  })

  function resetForm() {
    form.value = {
      weight: 0,
      images: [],
      audio: [],
      videos: [],
      models: [],
      parentId: null,
      translations: {},
    }
  }

  async function fetchAreaById(id) {
    const res = await axios.get(`/areas/${id}`)
    const area = res.data.area
    // Initialize form with default values
    const updatedForm = {
      id: area.id,
      weight: area.weight || 0,
      images: [...area.images],
      audio: [...area.audio],
      videos: [...area.videos],
      models: [...area.models],
      parentId: area.parentId || null,
      translations: {},
    }

    // Initialize translations for all languages
    languages.value.forEach((lang) => {
      updatedForm.translations[lang.locale] = {
        title: '',
        description: '',
        subtitle: '',
      }
    })

    // Update translations from API data
    if (area.translations && area.translations.length > 0) {
      area.translations.forEach((translation) => {
        updatedForm.translations[translation.language.locale] = {
          title: translation.title || '',
          description: translation.description || '',
          subtitle: translation.subtitle || '',
        }
      })
    }

    // Update form with the new values
    form.value = updatedForm
    isEdit.value = true
  }

  async function submitArea() {
    const sanitizedForm = Object.fromEntries(
      Object.entries({ ...form.value }).filter((entry) => entry[1] !== null),
    )
    if (isEdit.value) {
      await axios.put(`/areas/${form.value.id}`, sanitizedForm)
    } else {
      await axios.post('/areas', sanitizedForm)
    }
  }

  return { form, submitArea, resetForm, isEdit, fetchAreaById, areas }
})
