export const SUBURB = process.env.NEXT_PUBLIC_SUBURB_SLUG || "harfield";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "The Harfield Hub";
export const OWNER_WA = "27798196014";

export const CATEGORIES = [
  "Eat and drink", "Food and baking", "Retail and shops", "Trades and repairs",
  "Home and cleaning", "Garden and outdoor", "Health and wellness",
  "Beauty and hair", "Fitness and classes", "Kids and schooling",
  "Tutoring and lessons", "Pets", "Auto and transport",
  "Business and professional", "Creative and events", "Other",
];

export const WORKS_FROM = [
  { value: "customers_come_to_me", label: "Customers come to me", hint: "Shop, studio or rooms" },
  { value: "i_travel", label: "I travel to the customer", hint: "Callouts and home visits" },
  { value: "both", label: "Both" },
  { value: "online", label: "Online only" },
];
