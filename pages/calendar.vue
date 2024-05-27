<template>
  <div class="calendar">
    <h1 class="calendar-header">Calendar</h1>
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
.calendar-header {
  font-size: 2em;
}
</style>
