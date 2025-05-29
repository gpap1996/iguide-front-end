<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ language ? $t('languages.edit') : $t('languages.create') }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form ref="formRef" v-model="formValid">
        <v-text-field
          v-model="form.name"
          density="comfortable"
          variant="outlined"
          :label="$t('languages.name')"
          :rules="[(v) => !!v || $t('languages.nameRequired')]"
          required
          class="mb-4"
        ></v-text-field>

        <v-text-field
          v-model="form.locale"
          density="comfortable"
          variant="outlined"
          :label="$t('languages.code')"
          :rules="[(v) => !!v || $t('languages.localeRequired')]"
          required
          class="mb-4"
        ></v-text-field>
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
        @click="onSubmitLanguage"
        :loading="isLoading"
        :disabled="isLoading || !formValid"
      ></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useBaseStore } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const { language } = defineProps({ language: Object })
const emits = defineEmits(['close', 'reset'])

const baseStore = useBaseStore()
const { getLanguages } = baseStore
const { snackbar } = storeToRefs(baseStore)

const formRef = ref(null)
const formValid = ref(false)
const isLoading = ref(false)

const form = ref({
  name: null,
  locale: null,
})

onMounted(() => {
  if (language) {
    form.value.name = language.name
    form.value.locale = language.locale
  }
})

const onSubmitLanguage = async () => {
  isLoading.value = true
  try {
    // Validate form
    if (formRef.value) {
      const { valid } = await formRef.value.validate()
      if (!valid) {
        isLoading.value = false
        snackbar.value = {
          show: true,
          text: t('validation.required'),
          color: 'error',
          icon: 'mdi-alert-circle-outline',
        }
        return
      }
    }

    if (language) {
      await axios.put(`/languages/${language.id}`, {
        name: form.value.name,
        locale: form.value.locale,
      })
    } else {
      await axios.post('/languages', {
        name: form.value.name,
        locale: form.value.locale,
      })
    }

    await getLanguages()

    snackbar.value = {
      show: true,
      text: language ? t('languages.editSuccess') : t('languages.addSuccess'),
      color: 'success',
      icon: 'mdi-check-circle-outline',
    }

    emits('reset')
  } catch (error) {
    snackbar.value = {
      show: true,
      text: `${error?.response?.data?.error?.issues?.[0]?.message || t('common.error')}`,
      color: 'error',
      icon: 'mdi-alert-circle-outline',
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped></style>
