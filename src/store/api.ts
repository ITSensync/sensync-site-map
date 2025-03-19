import { defineStore } from "pinia";
import type { SparingData } from "../types/DataType";

export const useApiStore = defineStore("api", {
  state: () => ({
    dataSparing: [] as SparingData[],
    loading: false,
    errorData: {
      status: 0,
      message: "",
    },
  }),
  actions: {},
});
