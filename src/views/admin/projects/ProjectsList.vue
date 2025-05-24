<template>
  <div class="component-wrapper d-flex flex-column">
    <page-title title="Projects"></page-title>
    <v-container class="mt-4">
      <v-row>
        <v-col cols="12" md="6" lg="4" v-for="project in projects" :key="project.id">
          <v-card>
            <v-card-title>{{ project.name }}</v-card-title>
            <v-card-subtitle>{{ project.description }}</v-card-subtitle>
            <v-card-actions>
              <v-btn color="primary" :to="{ name: 'ProjectDetails', params: { id: project.id } }"
                >View Details</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
