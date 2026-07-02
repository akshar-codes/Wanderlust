import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const STORAGE_KEY = "wl-listing-wizard-draft";

export const WIZARD_STEPS = [
  { key: "basics", label: "Basic Details" },
  { key: "location", label: "Location" },
  { key: "images", label: "Images" },
  { key: "amenities", label: "Amenities" },
  { key: "pricing", label: "Pricing" },
  { key: "publish", label: "Publish" },
];

const initialData = {
  // Basics
  title: "",
  category: "",
  propertyType: "other",
  description: "",
  shortDescription: "",
  bedrooms: 1,
  bathrooms: 1,
  beds: 1,
  maxGuests: 2,
  // Location
  location: "",
  country: "",
  // Amenities
  amenities: [],
  // Pricing
  price: "",
  cleaningFee: "0",
  serviceFee: "0",
  taxes: "0",
  minimumStay: 1,
  maximumStay: "",
};

export const useListingWizardStore = create(
  persist(
    (set, get) => ({
      step: 0,
      maxReachedStep: 0,
      data: { ...initialData },
      images: [], // [{ id, file, previewUrl }] — deliberately NOT persisted (Files aren't serializable)
      lastSavedAt: null,

      setStep: (step) =>
        set((s) => ({
          step,
          maxReachedStep: Math.max(s.maxReachedStep, step),
        })),
      nextStep: () =>
        set((s) => {
          const step = Math.min(s.step + 1, WIZARD_STEPS.length - 1);
          return { step, maxReachedStep: Math.max(s.maxReachedStep, step) };
        }),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

      updateData: (patch) =>
        set((s) => ({
          data: { ...s.data, ...patch },
          lastSavedAt: Date.now(),
        })),

      setImages: (updater) =>
        set((s) => ({
          images: typeof updater === "function" ? updater(s.images) : updater,
          lastSavedAt: Date.now(),
        })),

      resetWizard: () => {
        get().images.forEach(
          (img) => img.previewUrl && URL.revokeObjectURL(img.previewUrl),
        );
        set({
          step: 0,
          maxReachedStep: 0,
          data: { ...initialData },
          images: [],
          lastSavedAt: null,
        });
      },

      hasDraft: () => {
        const { data } = get();
        return Boolean(data.title || data.description || data.location);
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist serializable, resumable fields — never File/blob state
      partialize: (state) => ({
        step: state.step,
        maxReachedStep: state.maxReachedStep,
        data: state.data,
      }),
    },
  ),
);
