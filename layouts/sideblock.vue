<script setup lang="ts">
import type { SideblockItem } from "~/components/layouts/sideblock/sideblock.types";

const links = ref<SideblockItem[]>([
  {
    type: "link",
    label: "Home",
    icon: "lucide:grid",
    to: "/",
  },
  {
    type: "link",
    label: "Dashboard",
    icon: "lucide:grid",
    to: "/app",
  },
  {
    type: "link",
    label: "Calendar",
    icon: "lucide:grid",
    to: "/calendar",
  },
]);
</script>

<template>
  <SideblockLayout :links open-on-mounted size="large">
    <slot />

    <template #logo>
      <h3 class="is-hidden-mobile ml-2">My app</h3>
    </template>

    <template #toolbar>
      <div class="toolbar-link">
        <VDarkmodeToggle />
      </div>
    </template>
  </SideblockLayout>
</template>
