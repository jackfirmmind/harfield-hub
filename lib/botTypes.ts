export type BotRole = "guest" | "resident" | "business" | "admin";

export type BotCtx = {
  role: BotRole;
  name?: string | null;
  businessName?: string | null;
  slug?: string | null;
  tier?: "free" | "pro" | "expert" | null;
  status?: string | null;      // pending | live | hidden | suspended
  pageStatus?: string | null;  // draft | pending | live
  adminNote?: string | null;
  verified?: boolean;
  trialEndsAt?: string | null;
  views?: number;
  msgs?: number;
  offers?: number;
  reviews?: number;
  rating?: number | null;
};

export type BotOption = {
  label: string;
  to?: string;      // another node
  href?: string;    // navigate in the app
  wa?: string;      // WhatsApp, with this topic
};

export type BotNode = {
  say: (c: BotCtx) => string[];
  options: (c: BotCtx) => BotOption[];
};
