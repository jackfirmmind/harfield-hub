export type ParsedItem = { name: string; description?: string; price?: string; group_name?: string };

/**
 * Turns a pasted menu or price list into structured items.
 * Handles the shapes people actually paste:
 *   Haircut - R180
 *   Haircut ........ 180
 *   Haircut  R180
 *   STARTERS            <- becomes a group heading
 *   Haircut | wash and cut | R180
 */
export function parseList(raw: string): ParsedItem[] {
  const out: ParsedItem[] = [];
  let group: string | undefined;

  const priceAt = /(?:^|[\s\-–—.:|])(r\s?\d[\d\s.,]*)\s*$/i;

  for (const line0 of raw.split(/\r?\n/)) {
    const line = line0.trim();
    if (!line) continue;

    // pipe separated wins if present
    if (line.includes("|")) {
      const parts = line.split("|").map((s) => s.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const last = parts[parts.length - 1];
        const hasPrice = /\d/.test(last);
        out.push({
          name: parts[0],
          description: parts.length > 2 ? parts.slice(1, hasPrice ? -1 : undefined).join(" ") : undefined,
          price: hasPrice ? tidyPrice(last) : undefined,
          group_name: group,
        });
        continue;
      }
    }

    const m = line.match(priceAt) || line.match(/(?:^|\s)(\d[\d\s.,]*)\s*$/);
    if (m) {
      let name = line.slice(0, line.length - m[1].length).trim();
      name = name.replace(/[\s.\-–—:|]+$/, "").trim();
      if (name) {
        out.push({ name, price: tidyPrice(m[1]), group_name: group });
        continue;
      }
    }

    // a short line with no price and no lowercase start reads as a heading
    const words = line.split(/\s+/).length;
    if (words <= 4 && !/\d/.test(line)) {
      group = line.replace(/[:：]+$/, "").trim();
      continue;
    }

    out.push({ name: line, group_name: group });
  }

  return out.slice(0, 200);
}

function tidyPrice(s: string): string {
  const n = s.replace(/[^\d.,]/g, "").replace(/\s/g, "");
  return n ? "R" + n : s.trim();
}
