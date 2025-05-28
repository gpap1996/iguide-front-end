<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <div class="px-8 py-4 scrollable flex-grow-1">
      <v-select
        v-model="selectedLanguageLocale"
        :items="languagesWithStatus"
        item-title="name"
        item-value="locale"
        variant="outlined"
        density="comfortable"
        label="Language"
        @update:model-value="checkCurrentLanguageValidity"
        persistent-hint
      >
        <template v-slot:item="{ props, item }">
          <v-list-item v-bind="props">
            <template v-slot:append>
              <v-icon v-if="!isLanguageValid(item.raw.locale)" color="error">
                mdi-alert-circle
              </v-icon>
              <v-icon v-else color="success"> mdi-check-circle </v-icon>
            </template>
          </v-list-item>
        </template>
      </v-select>

      <v-form ref="formRef" v-model="formValid">
        <div class="d-flex" style="gap: 16px">
          <v-text-field
            v-model="currentTitle"
            density="comfortable"
            variant="outlined"
            label="Title"
            required
            width="250"
          ></v-text-field>

          <v-text-field
            v-model="currentSubtitle"
            density="comfortable"
            variant="outlined"
            label="Subtitle"
            width="250"
          ></v-text-field>
        </div>
        <div class="d-flex" style="gap: 16px">
          <v-select
            v-model="form.parentId"
            :items="areas"
            density="comfortable"
            variant="outlined"
            label="Wider area"
            item-text="title"
            item-value="id"
            width="250"
          >
          </v-select>

          <v-text-field
            v-model="form.weight"
            density="comfortable"
            variant="outlined"
            label="Weight"
            type="number"
            @input="form.weight = Number(form.weight)"
            width="250"
          ></v-text-field>
        </div>

        <VuetifyTiptap
          label="Description"
          v-model="currentDescription"
          minHeight="250"
          maxHeight="250"
          markdown-theme="github"
          required
        />
      </v-form>
    </div>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useAreasStore } from '@/stores/areas'

const areasStore = useAreasStore()
const { form, areas } = storeToRefs(areasStore)

// Component state
const errorMessage = ref('')
const formRef = ref(null)
const formValid = ref(false)

const { languages } = storeToRefs(useBaseStore())

const selectedLanguageLocale = ref(languages.value[0]?.locale)

// Check if a language has valid title and description
const isLanguageValid = (locale) => {
  const translation = form.value.translations[locale]
  return translation && !!translation.title && !!translation.description
}

// Computed property to add validation status to language items
const languagesWithStatus = computed(() => {
  return languages.value.map((lang) => ({
    ...lang,
    isValid: isLanguageValid(lang.locale),
  }))
})

// Method to check the validity of the current language
const checkCurrentLanguageValidity = () => {
  errorMessage.value = ''
}

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

// Function to validate all languages
const validateAllLanguages = () => {
  // First ensure the current language form is valid
  if (formRef.value) {
    formRef.value.validate()
  }

  // Create translations for all languages if they don't exist
  languages.value.forEach((lang) => {
    if (!form.value.translations[lang.locale]) {
      form.value.translations[lang.locale] = {
        title: '',
        description: '',
        subtitle: '',
      }
    }
  })

  // Check all languages for required fields
  const missingFields = languages.value.filter((lang) => {
    const translation = form.value.translations[lang.locale]
    return !translation || !translation.title || !translation.description
  })

  if (missingFields.length > 0) {
    const missingLanguages = missingFields.map((lang) => lang.name).join(', ')
    errorMessage.value = `Title and description are required for the following languages: ${missingLanguages}`
    return false
  } else {
    errorMessage.value = ''
    return true
  }
}

// Export the validation function for the parent component
defineExpose({ validateAllLanguages })
</script>

<style lang="scss" scoped></style>
