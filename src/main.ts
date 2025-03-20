import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persistedstate";
import OpenLayersMap from "vue3-openlayers";

const app = createApp(App);
const pinia = createPinia();

app.use(OpenLayersMap);
app.use(pinia);
app.mount("#app");

pinia.use(piniaPersist);
