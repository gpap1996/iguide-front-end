<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ isEdit ? $t('externalFiles.edit') : $t('externalFiles.create') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="formValid">
        <!-- Name input -->
        <v-text-field
          v-model="form.name"
          :label="$t('common.name')"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || $t('externalFiles.nameRequired')]"
          required
          class="mb-4"
        ></v-text-field>

        <!-- Type selection -->
        <v-select
          v-model="form.type"
          :label="$t('common.type')"
          :items="fileTypes"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || $t('externalFiles.typeRequired')]"
          required
          class="mb-4"
        ></v-select>

        <!-- URL input -->
        <v-textarea
          v-model="form.url"
          :label="$t('common.url')"
          variant="outlined"
          density="comfortable"
          :rules="[(v) => !!v || $t('externalFiles.urlRequired')]"
          required
          class="mb-4"
        ></v-textarea>

        <!-- Language selection -->
        <v-select
          v-model="selectedLanguageLocale"
          :items="languages"
          item-title="name"
          item-value="locale"
          variant="outlined"
          density="comfortable"
          :label="$t('common.language')"
          class="mb-4"
          :hint="$t('files.languageHint')"
          persistent-hint
        ></v-select>

        <v-text-field
          v-model="currentTitle"
          density="comfortable"
          variant="outlined"
          :label="$t('common.title')"
        ></v-text-field>

        <VuetifyTiptap
          :label="$t('common.description')"
          v-model="currentDescription"
          minHeight="250"
          maxHeight="250"
          markdown-theme="github"
        />
      </v-form>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        :text="$t('common.close')"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn
        color="primary"
        :text="$t('common.save')"
        variant="flat"
        @click="onSubmitFile"
        :loading="isLoading"
        :disabled="isLoading || !canSubmit"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const baseStore = useBaseStore()
const { languages, snackbar } = storeToRefs(baseStore)

const props = defineProps({
  file: {
    type: Object,
    default: null,
  },
})
const emit = defineEmits(['close', 'reset'])

// Component state
const isLoading = ref(false)
const formRef = ref(null)
const formValid = ref(false)
const selectedLanguageLocale = ref(languages.value[0]?.locale)

const isEdit = computed(() => !!props.file)

// Check if form can be submitted
const canSubmit = computed(() => {
  return form.value.type && form.value.url
})

// Form data
const form = ref({
  name: '',
  type: null,
  url: '',
  translations: {},
})

const fileTypes = computed(() => [
  { title: t('externalFiles.video'), value: 'video' },
  { title: t('externalFiles.model'), value: 'model' },
])

// Computed properties for current translation fields
const currentTitle = computed({
  get: () => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    return translations[locale]?.title || ''
  },
  set: (value) => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    if (!translations[locale]) {
      translations[locale] = { title: '', description: '' }
    }
    translations[locale].title = value
  },
})

const currentDescription = computed({
  get: () => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    return translations[locale]?.description || ''
  },
  set: (value) => {
    const translations = form.value.translations
    const locale = selectedLanguageLocale.value
    if (!translations[locale]) {
      translations[locale] = { title: '', description: '' }
    }
    translations[locale].description = value
  },
})

onMounted(() => {
  if (props.file) {
    form.value.name = props.file.name
    form.value.type = props.file.type
    form.value.url = props.file.url

    // Initialize translations object
    const newTranslations = {}

    // Populate translations if they exist
    if (props.file.translations && props.file.translations.length > 0) {
      // Populate with actual data
      props.file.translations.forEach((translation) => {
        const locale = translation.language.locale
        newTranslations[locale] = {
          title: translation.title,
          description: translation.description,
        }
      })

      // Set translations
      form.value.translations = newTranslations

      // Set selected language to the first translation's language
      selectedLanguageLocale.value = props.file.translations[0].language.locale
    } else {
      // No translations exist, initialize all languages with empty values
      languages.value.forEach((lang) => {
        newTranslations[lang.locale] = { title: '', description: '' }
      })
      form.value.translations = newTranslations
    }
  } else {
    // New file mode - initialize translations with empty values
    const newTranslations = {}
    languages.value.forEach((lang) => {
      newTranslations[lang.locale] = { title: '', description: '' }
    })
    form.value.translations = newTranslations
  }
})

// Form submission handler
const onSubmitFile = async () => {
  try {
    isLoading.value = true

    // Validate form
    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: t('externalFiles.fillRequiredFields'),
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }
    }

    // Filter out empty translations (where both title and description are empty)
    const filteredTranslations = {}
    Object.keys(form.value.translations).forEach((locale) => {
      const translation = form.value.translations[locale]
      if (translation.title?.trim() || translation.description?.trim()) {
        filteredTranslations[locale] = translation
      }
    })

    const payload = {
      name: form.value.name,
      type: form.value.type,
      url: form.value.url,
      translations: filteredTranslations,
    }

    if (isEdit.value) {
      await axios.put(`/external-files/${props.file.id}`, payload)
    } else {
      await axios.post('/external-files', payload)
    }

    emit('reset')
    emit('close')
    snackbar.value = {
      show: true,
      text: isEdit.value ? t('externalFiles.editSuccess') : t('externalFiles.addSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error.response?.data?.error + '. ' + error.response?.data?.details}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }

    console.error('Error handling external file:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
