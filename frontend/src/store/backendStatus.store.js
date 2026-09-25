import { create } from "zustand";

export const useBackendStatusStore = create((set) => ({
  isUnavailable: false,
  setUnavailable: (isUnavailable) => set({ isUnavailable }),
}));
