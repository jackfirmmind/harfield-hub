"use client";
import { createClient } from "@/lib/supabase/client";

const sb = createClient();

export type TrackType = "view" | "whatsapp_tap" | "call_tap" | "save" | "page_view";

/** Fire and forget. Never block the user on analytics. */
export function track(businessId: string, type: TrackType) {
  try {
    void sb.from("activity").insert({ business_id: businessId, type });
  } catch {
    /* ignore */
  }
}
