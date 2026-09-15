export type Tier = "free" | "pro" | "expert";

export type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  one_line: string;
  whatsapp: string;
  phone: string | null;
  tier: Tier;
  starting_price: string | null;
  works_from: string | null;
  has_offer: boolean;
  has_page: boolean;
  photo: string | null;
};

export type OfferRow = {
  id: string;
  deal: string;
  fine_print: string | null;
  ends_at: string | null;
  businesses: { name: string; slug: string; whatsapp: string } | null;
};

export type EventRow = {
  id: string;
  title: string;
  detail: string | null;
  event_date: string;
  event_time: string | null;
  location: string | null;
  businesses: { name: string; slug: string } | null;
};
