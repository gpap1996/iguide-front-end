<template>
  <div class="pa-8 scrollable flex-grow-1">
    <v-form>
      <v-row>
        <v-col cols="6">
          <v-text-field density="comfortable" variant="outlined" label="Title"></v-text-field>
        </v-col>

        <v-col cols="6">
          <v-select density="comfortable" variant="outlined" label="Category"></v-select>
        </v-col>

        <v-col cols="6">
          <v-text-field density="comfortable" variant="outlined" label="Subtitle"></v-text-field>
        </v-col>

        <v-col cols="6">
          <v-text-field
            density="comfortable"
            variant="outlined"
            label="Order"
            type="number"
          ></v-text-field>
        </v-col>

        <v-col cols="6">
          <VuetifyTiptap minHeight="250" maxHeight="250" markdown-theme="github" />
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
