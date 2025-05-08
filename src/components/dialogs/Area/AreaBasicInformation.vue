<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <div class="px-8 py-4 scrollable flex-grow-1">
      <v-select
        v-model="selectedLanguageLocale"
        :items="languages"
        item-title="name"
        item-value="locale"
        variant="outlined"
        density="comfortable"
        label="Language"
      ></v-select>

      <v-form>
        <v-text-field
          v-model="currentTitle"
          density="comfortable"
          variant="outlined"
          label="Title"
        ></v-text-field>

        <v-text-field
          v-model="currentSubtitle"
          density="comfortable"
          variant="outlined"
          label="Subtitle"
        ></v-text-field>

        <v-select
          v-model="form.parentId"
          :items="areas"
          density="comfortable"
          variant="outlined"
          label="Wider area"
          item-text="title"
          item-value="id"
        >
        </v-select>

        <v-text-field
          v-model="form.weight"
          density="comfortable"
          variant="outlined"
          label="Weight"
          type="number"
          @input="form.weight = Number(form.weight)"
        ></v-text-field>

        <VuetifyTiptap
          label="Description"
          v-model="currentDescription"
          minHeight="250"
          maxHeight="250"
          markdown-theme="github"
        />

        <v-alert v-if="errorMessage" type="error" variant="tonal" closable class="mt-4">
          {{ errorMessage }}
        </v-alert>
      </v-form>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useAreasStore } from '@/stores/areas'
import axios from 'axios'

onMounted(async () => {
  if (areas.value.length) return
  const res = await axios.get('/areas/dropdown', {
    params: {
      limit: -1,
    },
    headers: {
      'Accept-Language': 'el',
    },
  })

  areas.value = res.data.items
})

const areasStore = useAreasStore()
const { form } = storeToRefs(areasStore)

// Component state
const errorMessage = ref('')

const { languages } = storeToRefs(useBaseStore())

const selectedLanguageLocale = ref(languages.value[0]?.locale)

const areas = ref([])
// Form data

const currentTitle = computed({
  get: () => form.value.translations[selectedLanguageLocale.value]?.title || '',
  set: (value) => {
    if (!form.value.translations[selectedLanguageLocale.value]) {
      form.value.translations[selectedLanguageLocale.value] = {}
    }
    form.value.translations[selectedLanguageLocale.value].title = value
  },
})

const currentSubtitle = computed({
  get: () => form.value.translations[selectedLanguageLocale.value]?.subtitle || '',
  set: (value) => {
    if (!form.value.translations[selectedLanguageLocale.value]) {
      form.value.translations[selectedLanguageLocale.value] = {}
    }
    form.value.translations[selectedLanguageLocale.value].subtitle = value
  },
})

const currentDescription = computed({
  get: () => form.value.translations[selectedLanguageLocale.value]?.description || '',
  set: (value) => {
    if (!form.value.translations[selectedLanguageLocale.value]) {
      form.value.translations[selectedLanguageLocale.value] = {}
    }
    form.value.translations[selectedLanguageLocale.value].description = value
  },
})
</script>

<style lang="scss" scoped></style>
