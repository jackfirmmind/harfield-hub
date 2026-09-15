/** 0798196014 or 079 819 6014 -> 27798196014 */
export function waNumber(raw: string): string {
  const d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("27")) return d;
  if (d.startsWith("0")) return "27" + d.slice(1);
  return d;
}

export function waLink(raw: string, text: string): string {
  return `https://wa.me/${waNumber(raw)}?text=${encodeURIComponent(text)}`;
}

export function telLink(raw: string): string {
  return "tel:" + (raw || "").replace(/\s/g, "");
}

export function prettyDate(iso: string): { d: string; m: string } {
  const dt = new Date(iso + "T00:00:00");
  return {
    d: String(dt.getDate()).padStart(2, "0"),
    m: dt.toLocaleString("en-ZA", { month: "short" }),
  };
}
