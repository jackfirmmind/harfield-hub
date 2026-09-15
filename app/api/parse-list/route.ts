import { NextResponse } from "next/server";
import { parseList } from "@/lib/parseList";

/**
 * Turns pasted text into structured items.
 * Uses Claude when ANTHROPIC_API_KEY is set, otherwise the built in parser.
 * The built in parser is the fallback, so this always returns something usable.
 */
export async function POST(req: Request) {
  const { text } = await req.json().catch(() => ({ text: "" }));
  if (!text || typeof text !== "string") {
    return NextResponse.json({ items: [] });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          system:
            "You turn a South African business menu or price list into JSON. " +
            "Return ONLY a JSON array, no prose, no markdown fences. " +
            'Each element: {"name":string,"description":string|null,"price":string|null,"group_name":string|null}. ' +
            "Keep prices exactly as written, with the R. Use group_name for section headings such as Starters or Ladies. " +
            "Do not invent items or prices.",
          messages: [{ role: "user", content: text.slice(0, 12000) }],
        }),
      });
      const data = await res.json();
      const body = (data?.content || [])
        .filter((c: any) => c.type === "text")
        .map((c: any) => c.text)
        .join("")
        .replace(/```json|```/g, "")
        .trim();
      const parsed = JSON.parse(body);
      if (Array.isArray(parsed) && parsed.length) {
        return NextResponse.json({
          items: parsed.slice(0, 200).map((i: any) => ({
            name: String(i.name || "").slice(0, 120),
            description: i.description ? String(i.description).slice(0, 300) : null,
            price: i.price ? String(i.price).slice(0, 40) : null,
            group_name: i.group_name ? String(i.group_name).slice(0, 60) : null,
          })),
          source: "ai",
        });
      }
    } catch {
      /* fall through to the built in parser */
    }
  }

  return NextResponse.json({ items: parseList(text), source: "basic" });
}
