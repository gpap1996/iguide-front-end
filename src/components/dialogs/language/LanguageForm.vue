<template>
  <v-card class="flex-grow-1 d-flex flex-column">
    <v-card-title class="d-flex align-center bg-primary-darken-1">
      <div class="title">{{ language ? 'Edit Language' : 'Upload Language' }}</div>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="$emit('close')"></v-btn>
    </v-card-title>

    <div class="pa-8 scrollable flex-grow-1">
      <v-form>
        <v-text-field
          v-model="form.name"
          density="comfortable"
          variant="outlined"
          label="Name"
        ></v-text-field>

        <v-text-field
          v-model="form.locale"
          density="comfortable"
          variant="outlined"
          label="Code"
        ></v-text-field>
      </v-form>
    </div>

    <v-card-actions class="my-4 mr-2">
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        variant="outlined"
        text="Close"
        @click="$emit('close')"
        class="mr-2"
      ></v-btn>
      <v-btn color="primary" text="Save" variant="flat" @click="onSubmitLanguage"></v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const { language } = defineProps({ language: Object })
const emits = defineEmits(['close', 'reset'])

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
  try {
    await axios.post('/language', {
      name: form.value.name,
      locale: form.value.locale,
    })
    emits('reset')
  } catch (error) {
    console.error('Error uploading language:', error)
  }
}
</script>

<style lang="scss" scoped></style>
