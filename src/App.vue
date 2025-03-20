<script setup lang="ts">
// import MapView from "./components/MapLeafleat.vue";
import MapAlter from "./components/MapAlter.vue";
import Navbar from "./components/Navbar.vue";
</script>

<template>
  <Navbar />
  <div class="bg-color-neutral flex flex-col items-center justify-center">
    <!-- <MapView /> -->
    <MapAlter />
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
