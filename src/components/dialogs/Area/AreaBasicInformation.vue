<template>
  <v-form class="pa-8">
    <v-row>
      <v-col cols="12">
        <v-text-field variant="outlined" label="Title"></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-text-field variant="outlined" label="Subtitle"></v-text-field>
      </v-col>

      <v-col cols="12">
        <menu-bar :editor="editor" />
        <editor-content :editor="editor" />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

const editor = useEditor({
  content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
  extensions: [StarterKit],
})
</script>

<style lang="scss" scoped></style>
