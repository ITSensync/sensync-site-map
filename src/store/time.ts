import { defineStore } from "pinia";

export const useTimeStore = defineStore("time", {
  state: () => ({
    time: "",
    date: "",
  }),
  actions: {
    updateDateTime() {
      const now = new Date();

      this.time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      this.date = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    startClock() {
      this.updateDateTime();
      setInterval(this.updateDateTime, 1000);
    },
  },
});
