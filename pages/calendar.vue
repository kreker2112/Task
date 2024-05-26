<template>
  <div>
    <h1>Calendar</h1>
    <CalendarComponent />
  </div>
</template>

<script setup lang="ts">
import CalendarComponent from "~/components/CalendarComponent.vue";

definePageMeta({
  layout: "sideblock",
});
</script>

<style scoped>
/* Добавьте стили для страницы календаря */
</style>
