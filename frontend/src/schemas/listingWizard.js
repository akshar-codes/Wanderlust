import { z } from "zod";
import { LISTING_CATEGORIES } from "./index";

export const PROPERTY_TYPES = [
  "apartment",
  "house",
  "villa",
  "cottage",
  "cabin",
  "studio",
  "loft",
  "treehouse",
  "boat",
  "camper",
  "tent",
  "bungalow",
  "chalet",
  "castle",
  "farm",
  "other",
];

export const basicDetailsSchema = z.object({
  title: z.string().min(5, "Title should be at least 5 characters").max(100),
  category: z.enum(LISTING_CATEGORIES, { message: "Select a category" }),
  propertyType: z.enum(PROPERTY_TYPES).default("other"),
  description: z.string().min(20, "Tell guests a bit more (min 20 characters)"),
  shortDescription: z.string().max(160).optional().or(z.literal("")),
  bedrooms: z.coerce.number().int().min(0),
  bathrooms: z.coerce.number().min(0),
  beds: z.coerce.number().int().min(1, "At least 1 bed"),
  maxGuests: z.coerce.number().int().min(1, "At least 1 guest"),
});

export const locationSchema = z.object({
  location: z.string().min(3, "Enter a location (area, city)"),
  country: z.string().min(2, "Enter a country"),
});

export const pricingSchema = z.object({
  price: z.coerce.number().min(1, "Set a nightly price"),
  cleaningFee: z.coerce.number().min(0).default(0),
  serviceFee: z.coerce.number().min(0).default(0),
  taxes: z.coerce.number().min(0).default(0),
  minimumStay: z.coerce.number().int().min(1).default(1),
  maximumStay: z
    .union([z.coerce.number().int().min(1), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

// Amenities has no hard requirement — just shape validation
export const amenitiesSchema = z.object({
  amenities: z.array(z.string()).default([]),
});

export const AMENITY_GROUPS = [
  {
    label: "Essentials",
    items: [
      { key: "wifi", label: "Wifi", icon: "📶" },
      { key: "kitchen", label: "Kitchen", icon: "🍳" },
      { key: "washer", label: "Washer", icon: "🧺" },
      { key: "air_conditioning", label: "Air conditioning", icon: "❄️" },
      { key: "heating", label: "Heating", icon: "🔥" },
      { key: "dedicated_workspace", label: "Workspace", icon: "💻" },
      { key: "free_parking", label: "Free parking", icon: "🅿️" },
      { key: "tv", label: "TV", icon: "📺" },
    ],
  },
  {
    label: "Outdoor & views",
    items: [
      { key: "pool", label: "Pool", icon: "🏊" },
      { key: "hot_tub", label: "Hot tub", icon: "🛁" },
      { key: "bbq_grill", label: "BBQ grill", icon: "🍖" },
      { key: "mountain_view", label: "Mountain view", icon: "⛰️" },
      { key: "ocean_view", label: "Ocean view", icon: "🌊" },
      { key: "garden", label: "Garden", icon: "🌳" },
      { key: "balcony", label: "Balcony", icon: "🏞️" },
      { key: "fire_pit", label: "Fire pit", icon: "🔥" },
    ],
  },
  {
    label: "Safety",
    items: [
      { key: "smoke_alarm", label: "Smoke alarm", icon: "🚨" },
      { key: "carbon_monoxide_alarm", label: "CO alarm", icon: "⚠️" },
      { key: "fire_extinguisher", label: "Fire extinguisher", icon: "🧯" },
      { key: "first_aid_kit", label: "First aid kit", icon: "🩹" },
    ],
  },
  {
    label: "Family & accessibility",
    items: [
      { key: "crib", label: "Crib", icon: "🍼" },
      { key: "step_free_access", label: "Step-free access", icon: "♿" },
      { key: "elevator", label: "Elevator", icon: "🛗" },
      { key: "gym", label: "Gym", icon: "🏋️" },
    ],
  },
];
