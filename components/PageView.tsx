"use client";
import { useEffect } from "react";
import { track } from "./Track";

export default function PageView({ businessId }: { businessId: string }) {
  useEffect(() => {
    track(businessId, "page_view");
  }, [businessId]);
  return null;
}
