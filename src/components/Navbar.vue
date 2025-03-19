<script setup lang="ts">
import { onMounted } from "vue";
import { useTimeStore } from "../store/time.ts";
import Sidebar from "./Sidebar.vue";

const timeStore = useTimeStore();
onMounted(() => {
  timeStore.startClock();
});
</script>

<template>
  <div class="navbar h-10 bg-base-100 shadow-md px-6">
    <div class="navbar-start">
      <Sidebar />
    </div>
    <div class="navbar-center">
      <a class="text-2xl font-extrabold">Sensync Site</a>
    </div>
    <div class="navbar-end">
      <ul class="menu menu-horizontal px-1">
        <div class="flex flex-col justify-end items-end">
          <p class="text-md font-bold">
            {{ timeStore.date }}
          </p>
          <p class="text-md font-semibold">{{ timeStore.time }}</p>
        </div>
      </ul>
    </div>
  </div>
</template>
