"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls, btnPrimary, btnGhost } from "@/components/ui";

type Item = { id?: string; name: string; description?: string | null; price?: string | null; group_name?: string | null };
type Page = {
  about: string | null; colour_primary: string | null; colour_accent: string | null;
  logo_url: string | null; photos: string[] | null; status: string; admin_note: string | null;
} | null;

const SWATCHES = [
  { name: "Deep teal", p: "#0E4A4F", a: "#F2B705" },
  { name: "Forest", p: "#1F4D36", a: "#E8B33C" },
  { name: "Ink blue", p: "#1B3A5C", a: "#F0A500" },
  { name: "Plum", p: "#4A2545", a: "#E9B44C" },
  { name: "Clay", p: "#7A3B2E", a: "#EFC050" },
  { name: "Charcoal", p: "#25282A", a: "#F2B705" },
];

const MAX_PHOTOS = 6;

export default function PageBuilder({
  business, initialPage, initialItems,
}: {
  business: { id: string; name: string; slug: string; tier: string; status: string };
  initialPage: Page;
  initialItems: Item[];
}) {
  const router = useRouter();
  const sb = createClient();

  const [about, setAbout] = useState(initialPage?.about || "");
  const [primary, setPrimary] = useState(initialPage?.colour_primary || SWATCHES[0].p);
  const [accent, setAccent] = useState(initialPage?.colour_accent || SWATCHES[0].a);
  const [logo, setLogo] = useState<string | null>(initialPage?.logo_url || null);
  const [photos, setPhotos] = useState<string[]>((initialPage?.photos as string[]) || []);
  const [items, setItems] = useState<Item[]>(initialItems);
  const [raw, setRaw] = useState("");
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const status = initialPage?.status || "draft";

  async function upload(file: File, kind: "logo" | "photo") {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `${business.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await sb.storage.from("business-media").upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = sb.storage.from("business-media").getPublicUrl(path);
    return data.publicUrl;
  }

  async function onLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setBusy("Uploading your logo…"); setErr("");
    try { setLogo(await upload(file, "logo")); }
    catch (x: any) { setErr(x.message || "That upload failed."); }
    setBusy("");
  }

  async function onPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    if (!files.length) return;
    setBusy(`Uploading ${files.length} photo${files.length > 1 ? "s" : ""}…`); setErr("");
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await upload(f, "photo"));
      setPhotos((p) => [...p, ...urls].slice(0, MAX_PHOTOS));
    } catch (x: any) { setErr(x.message || "That upload failed."); }
    setBusy("");
  }

  async function parse() {
    if (!raw.trim()) return;
    setBusy("Reading your list…"); setErr("");
    try {
      const res = await fetch("/api/parse-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: raw }),
      });
      const { items: got } = await res.json();
      if (got?.length) { setItems((p) => [...p, ...got]); setRaw(""); }
      else setErr("Could not read that. Try one item per line, like: Haircut - R180");
    } catch { setErr("Could not read that. Try again."); }
    setBusy("");
  }

  const editItem = (i: number, k: keyof Item, v: string) =>
    setItems((p) => p.map((it, n) => (n === i ? { ...it, [k]: v } : it)));
  const removeItem = (i: number) => setItems((p) => p.filter((_, n) => n !== i));

  async function save(submit: boolean) {
    setBusy(submit ? "Sending for review…" : "Saving…"); setErr(""); setMsg("");

    const { error: pErr } = await sb.from("pages").upsert(
      {
        business_id: business.id,
        about: about || null,
        colour_primary: primary,
        colour_accent: accent,
        logo_url: logo,
        photos,
        status: submit ? "pending" : "draft",
      },
      { onConflict: "business_id" }
    );
    if (pErr) { setErr(pErr.message); setBusy(""); return; }

    await sb.from("items").delete().eq("business_id", business.id);
    if (items.length) {
      const { error: iErr } = await sb.from("items").insert(
        items.map((it, n) => ({
          business_id: business.id,
          name: it.name,
          description: it.description || null,
          price: it.price || null,
          group_name: it.group_name || null,
          sort_order: n,
        }))
      );
      if (iErr) { setErr(iErr.message); setBusy(""); return; }
    }

    setBusy("");
    setMsg(submit ? "Sent. Jack will check it and publish it, usually within a day." : "Saved.");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[760px] px-5 py-10">
      <p className="text-[0.9rem] text-inkSoft mb-2">
        <Link href="/dashboard">← Back to your dashboard</Link>
      </p>
      <h1 className="h-display text-[2rem] mb-1">Build your page</h1>
      <p className="text-inkSoft mb-7 text-[0.95rem]">
        Fill in what you can. You can come back and change it whenever you like.
      </p>

      {status === "pending" && (
        <div className="bg-surface2 border border-line rounded-card p-4 mb-6 text-[0.93rem]">
          Your page is with Jack for review. You can still make changes.
        </div>
      )}
      {status === "live" && (
        <div className="bg-surface2 border border-line rounded-card p-4 mb-6 text-[0.93rem]">
          Your page is live at <Link href={`/b/${business.slug}`}>/b/{business.slug}</Link>.
          Changes go back for review before they show.
        </div>
      )}
      {initialPage?.admin_note && (
        <div className="bg-accent text-accentInk rounded-card p-4 mb-6 text-[0.93rem]">
          <strong>Jack asked for a change:</strong> {initialPage.admin_note}
        </div>
      )}

      {/* ABOUT */}
      <Field label="About your business"
        hint="A short paragraph. What you do, how long you have been doing it, what makes you different.">
        <textarea className={inputCls + " min-h-[140px]"} maxLength={1200} value={about}
          onChange={(e) => setAbout(e.target.value)}
          placeholder="We have been fixing geysers in the southern suburbs for eleven years…" />
        <p className="text-[0.8rem] text-inkSoft text-right mt-1 m-0">{about.length} / 1200</p>
      </Field>

      {/* COLOURS */}
      <Field label="Your colours" hint="Pick one that suits your branding, or set your own.">
        <div className="flex gap-2 flex-wrap mb-3">
          {SWATCHES.map((s) => (
            <button key={s.name} type="button"
              onClick={() => { setPrimary(s.p); setAccent(s.a); }}
              aria-label={s.name}
              className={"w-12 h-12 rounded-btn border-2 " + (primary === s.p ? "border-ink" : "border-line")}
              style={{ background: s.p }}>
              <span className="block w-3 h-3 rounded-full ml-auto mr-1 mb-1 mt-auto"
                style={{ background: s.a }} />
            </button>
          ))}
        </div>
        <div className="flex gap-4 items-center flex-wrap text-[0.88rem]">
          <label className="flex items-center gap-2">
            Main
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)}
              className="w-10 h-10 rounded border border-line bg-transparent" />
          </label>
          <label className="flex items-center gap-2">
            Highlight
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
              className="w-10 h-10 rounded border border-line bg-transparent" />
          </label>
        </div>
      </Field>

      {/* LOGO */}
      <Field label="Your logo" hint="Optional. A square image works best.">
        <div className="flex items-center gap-4 flex-wrap">
          {logo && <img src={logo} alt="" className="w-20 h-20 object-contain rounded-btn border border-line bg-surface" />}
          <label className={btnGhost + " cursor-pointer"}>
            {logo ? "Change logo" : "Upload a logo"}
            <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
          </label>
          {logo && <button className="text-[0.88rem] underline" onClick={() => setLogo(null)}>Remove</button>}
        </div>
      </Field>

      {/* PHOTOS */}
      <Field label={`Photos (${photos.length} of ${MAX_PHOTOS})`}
        hint="Your work, your shop, your team. These do more than anything else to get you chosen.">
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] mb-3">
          {photos.map((src, i) => (
            <div key={src} className="relative">
              <img src={src} alt="" className="w-full h-28 object-cover rounded-btn border border-line" />
              <button onClick={() => setPhotos((p) => p.filter((_, n) => n !== i))}
                aria-label="Remove photo"
                className="absolute top-1 right-1 w-8 h-8 rounded-full bg-ink text-paper font-bold">×</button>
            </div>
          ))}
        </div>
        {photos.length < MAX_PHOTOS && (
          <label className={btnGhost + " cursor-pointer"}>
            Add photos
            <input type="file" accept="image/*" multiple className="hidden" onChange={onPhotos} />
          </label>
        )}
      </Field>

      {/* PRICE LIST */}
      <Field label="Your services, menu or price list"
        hint="Paste it in, one per line. We turn it into a proper list. Example: Haircut - R180">
        <textarea className={inputCls + " min-h-[120px]"} value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"Callout - R350\nGeyser replacement - R4500\nLeak repair - R450"} />
        <button className={btnGhost + " mt-3"} onClick={parse} disabled={!raw.trim()}>
          Turn this into a list
        </button>
      </Field>

      {items.length > 0 && (
        <div className="mb-6">
          <p className="font-semibold text-[0.95rem] mb-2">{items.length} items</p>
          <div className="grid gap-2">
            {items.map((it, i) => (
              <div key={i} className="bg-surface border border-line rounded-btn p-3 flex gap-2 flex-wrap items-center">
                <input className={inputCls + " flex-1 min-w-[160px] py-2"} value={it.name}
                  onChange={(e) => editItem(i, "name", e.target.value)} />
                <input className={inputCls + " w-[110px] py-2"} value={it.price || ""} placeholder="R"
                  onChange={(e) => editItem(i, "price", e.target.value)} />
                <button onClick={() => removeItem(i)} aria-label="Remove item"
                  className="w-10 h-10 rounded-full border border-line font-bold">×</button>
              </div>
            ))}
          </div>
          <button className="text-[0.88rem] underline mt-3" onClick={() => setItems([])}>
            Clear the whole list
          </button>
        </div>
      )}

      {busy && <p className="text-[0.92rem] text-inkSoft">{busy}</p>}
      {err && <p className="text-[0.92rem] font-semibold" style={{ color: "#B23A2E" }}>{err}</p>}
      {msg && <p className="text-[0.92rem] font-semibold text-primary">{msg}</p>}

      <div className="flex gap-3 flex-wrap mt-6 pt-5 border-t border-line">
        <button className={btnGhost} onClick={() => save(false)} disabled={!!busy}>Save for later</button>
        <button className={btnPrimary + " flex-1"} onClick={() => save(true)} disabled={!!busy}>
          Send for review
        </button>
      </div>
    </div>
  );
}
