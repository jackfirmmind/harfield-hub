"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, WORKS_FROM, SUBURB } from "@/lib/config";
import { Field, Option, inputCls, btnPrimary, btnGhost } from "@/components/ui";

type Form = {
  name: string; ownerName: string; category: string; street: string; worksFrom: string;
  whatsapp: string; phone: string; email: string; password: string;
  website: string; hours: string;
  oneLine: string; keywords: string; startingPrice: string;
  tier: "free" | "pro" | "expert";
  agreePricing: boolean; agreePublish: boolean;
};

const BLANK: Form = {
  name: "", ownerName: "", category: "", street: "", worksFrom: "",
  whatsapp: "", phone: "", email: "", password: "",
  website: "", hours: "",
  oneLine: "", keywords: "", startingPrice: "",
  tier: "free", agreePricing: false, agreePublish: false,
};

const DRAFT = "hub_join_draft";
const STEPS = ["Your business", "How to reach you", "What you offer", "Choose your plan", "Confirm"];

const digits = (s: string) => s.replace(/\D/g, "");
const validPhone = (s: string) => digits(s).length >= 9;
const validEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());

export default function Apply() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [f, setF] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [fatal, setFatal] = useState("");
  const [left, setLeft] = useState<{ listing: number; pro: number } | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  // restore any half finished draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT);
      if (raw) setF({ ...BLANK, ...JSON.parse(raw), password: "" });
    } catch {}
    createClient().rpc("founding_places_left").then(({ data }) => {
      const row = Array.isArray(data) ? data[0] : data;
      if (row) setLeft({ listing: row.listing_left, pro: row.pro_left });
    });
  }, []);

  useEffect(() => {
    try {
      const { password, ...rest } = f;
      localStorage.setItem(DRAFT, JSON.stringify(rest));
    } catch {}
  }, [f]);

  function validate(n: number) {
    const e: Record<string, string> = {};
    if (n === 1) {
      if (!f.name.trim()) e.name = "Please add your business name.";
      if (!f.ownerName.trim()) e.ownerName = "Please add your name.";
      if (!f.category) e.category = "Please choose a category.";
      if (!f.worksFrom) e.worksFrom = "Please pick one.";
    }
    if (n === 2) {
      if (!validPhone(f.whatsapp)) e.whatsapp = "Please add a valid WhatsApp number.";
      if (!validEmail(f.email)) e.email = "Please add a valid email address.";
      if (f.password.length < 8) e.password = "At least 8 characters.";
    }
    if (n === 3) {
      if (!f.oneLine.trim()) e.oneLine = "Please describe what you do.";
    }
    if (n === 5) {
      if (!f.agreePricing || !f.agreePublish) e.agree = "Please tick both boxes to continue.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function back() {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!validate(5)) return;
    setBusy(true); setFatal("");
    const sb = createClient();

    const { data: auth, error: authErr } = await sb.auth.signUp({
      email: f.email.trim(),
      password: f.password,
      options: { data: { full_name: f.ownerName, role: "business" } },
    });
    if (authErr) { setBusy(false); setFatal(authErr.message); return; }

    const userId = auth.user?.id;
    if (!auth.session || !userId) {
      setBusy(false);
      setFatal("Your account was created. Please check your email to confirm it, then log in and finish your listing.");
      return;
    }

    const { data: suburb } = await sb.from("suburbs").select("id").eq("slug", SUBURB).maybeSingle();
    const { data: slug } = await sb.rpc("make_slug", { p_name: f.name });

    const { error: bizErr } = await sb.from("businesses").insert({
      suburb_id: suburb?.id,
      owner_id: userId,
      name: f.name.trim(),
      slug: slug || f.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: f.category,
      one_line: f.oneLine.trim(),
      whatsapp: digits(f.whatsapp),
      phone: f.phone ? digits(f.phone) : null,
      street: f.street || null,
      hours: f.hours || null,
      keywords: f.keywords || null,
      works_from: f.worksFrom,
      starting_price: f.startingPrice || null,
      website_or_social: f.website || null,
      tier: f.tier,
      status: "pending",
    });

    setBusy(false);
    if (bizErr) { setFatal(bizErr.message); return; }

    try { localStorage.removeItem(DRAFT); } catch {}

    if (f.tier === "free") router.push("/dashboard?welcome=1");
    else router.push("/dashboard?upgrade=1");
    router.refresh();
  }

  const pct = Math.round(((step - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="mx-auto max-w-[680px] px-5 py-10">
      {/* progress */}
      <div className="sticky top-[60px] z-20 bg-paper pt-3 pb-3 border-b border-line mb-7">
        <div className="h-[6px] bg-surface2 rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: pct + "%" }} />
        </div>
        <div className="flex justify-between mt-2 text-[0.82rem] text-inkSoft font-semibold">
          <span>Step {step} of {STEPS.length} — {STEPS[step - 1]}</span>
          <span>{pct}%</span>
        </div>
      </div>

      {step === 1 && (
        <>
          <h1 className="h-display text-[1.7rem] mb-1">Your business</h1>
          <p className="text-inkSoft mb-6 text-[0.94rem]">The basics residents see first.</p>
          <Field label="Business name" error={errors.name}>
            <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Your name" error={errors.ownerName}>
            <input className={inputCls} value={f.ownerName} onChange={(e) => set("ownerName", e.target.value)} />
          </Field>
          <Field label="Category" error={errors.category}>
            <select className={inputCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">Choose one…</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Street in Harfield Village" hint="Only the street name shows publicly, never your house number.">
            <input className={inputCls} value={f.street} placeholder="Second Avenue"
              onChange={(e) => set("street", e.target.value)} />
          </Field>
          <Field label="Where do you work from?" error={errors.worksFrom}>
            <div className="grid gap-2">
              {WORKS_FROM.map((o) => (
                <Option key={o.value} label={o.label} hint={o.hint}
                  checked={f.worksFrom === o.value} onChange={() => set("worksFrom", o.value)} />
              ))}
            </div>
          </Field>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="h-display text-[1.7rem] mb-1">How to reach you</h1>
          <p className="text-inkSoft mb-6 text-[0.94rem]">
            The WhatsApp number is the button residents tap.
          </p>
          <Field label="WhatsApp number" hint="For example 082 123 4567" error={errors.whatsapp}>
            <input className={inputCls} type="tel" inputMode="tel" value={f.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)} />
          </Field>
          <Field label="Number for calls" hint="Leave blank if it is the same as WhatsApp.">
            <input className={inputCls} type="tel" inputMode="tel" value={f.phone}
              onChange={(e) => set("phone", e.target.value)} />
          </Field>
          <Field label="Email" hint="This becomes your login." error={errors.email}>
            <input className={inputCls} type="email" value={f.email}
              onChange={(e) => set("email", e.target.value)} />
          </Field>
          <Field label="Choose a password" hint="At least 8 characters" error={errors.password}>
            <input className={inputCls} type="password" value={f.password}
              onChange={(e) => set("password", e.target.value)} />
          </Field>
          <Field label="Website, Instagram or Facebook">
            <input className={inputCls} value={f.website} placeholder="instagram.com/yourbusiness"
              onChange={(e) => set("website", e.target.value)} />
          </Field>
          <Field label="Trading hours">
            <input className={inputCls} value={f.hours} placeholder="Mon to Fri 8am to 5pm"
              onChange={(e) => set("hours", e.target.value)} />
          </Field>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="h-display text-[1.7rem] mb-1">What you offer</h1>
          <p className="text-inkSoft mb-6 text-[0.94rem]">This is what residents read and search.</p>
          <Field label="One line about what you do"
            hint="Keep it plain and specific. This is the line on your card."
            error={errors.oneLine}>
            <textarea className={inputCls + " min-h-[92px]"} maxLength={140} value={f.oneLine}
              placeholder="Geysers, leaks and blockages. Same-day callouts in the village."
              onChange={(e) => set("oneLine", e.target.value)} />
            <p className="text-[0.8rem] text-inkSoft text-right mt-1 m-0">{f.oneLine.length} / 140</p>
          </Field>
          <Field label="Words residents might search for" hint="Separate with commas. Hidden, but makes you findable.">
            <input className={inputCls} value={f.keywords} placeholder="plumber, geyser, leak, drain, emergency"
              onChange={(e) => set("keywords", e.target.value)} />
          </Field>
          <Field label="Starting price or callout fee" hint="Optional. Listings that show a price get more messages.">
            <input className={inputCls} value={f.startingPrice} placeholder="From R350 per callout"
              onChange={(e) => set("startingPrice", e.target.value)} />
          </Field>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="h-display text-[1.7rem] mb-1">Choose your plan</h1>
          <p className="text-inkSoft mb-6 text-[0.94rem]">You can change this any time.</p>

          {left && left.pro > 0 && (
            <p className="inline-block bg-accent text-accentInk font-bold text-[0.85rem] px-3 py-2 rounded-full mb-4">
              {left.pro} founding Pro places left · R199 locked for 12 months
            </p>
          )}

          <div className="grid gap-3">
            <Option
              label="Get found — Free"
              hint="Your first 90 days are free, then R49 a month. Listing, WhatsApp and call buttons, and your view count."
              checked={f.tier === "free"} onChange={() => set("tier", "free")} />
            <Option
              label="Get chosen — Pro, R199 a month"
              hint="Billed from day one, no free period. Verified badge, reviews, your own page with photos and prices, unlimited offers, a QR code. Ranked above free listings."
              checked={f.tier === "pro"} onChange={() => set("tier", "pro")} />
            <Option
              label="Get seen first — Expert, R449 a month"
              hint="Billed from day one, no free period. Everything in Pro, plus top of your category, payment links and a monthly coaching session."
              checked={f.tier === "expert"} onChange={() => set("tier", "expert")} />
          </div>

          <p className="mt-5 text-[0.88rem] text-inkSoft">
            The free 90 days applies to the Free plan only. Pro and Expert start
            billing straight away. You can change plan any time.
          </p>
        </>
      )}

      {step === 5 && (
        <>
          <h1 className="h-display text-[1.7rem] mb-1">Check and send</h1>
          <p className="text-inkSoft mb-6 text-[0.94rem]">A quick look before it goes off.</p>

          <div className="bg-surface border border-line rounded-card p-5 mb-6 grid gap-[2px]">
            {[
              ["Business", f.name], ["Your name", f.ownerName], ["Category", f.category],
              ["Street", f.street], ["Works from", WORKS_FROM.find((w) => w.value === f.worksFrom)?.label || ""],
              ["WhatsApp", f.whatsapp], ["Call number", f.phone], ["Email", f.email],
              ["Online", f.website], ["Hours", f.hours],
              ["One line", f.oneLine], ["Keywords", f.keywords], ["From", f.startingPrice],
              ["Plan", f.tier === "free" ? "Free" : f.tier === "pro" ? "Pro" : "Expert"],
            ].filter(([, v]) => v).map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-[0.78rem] text-inkSoft font-semibold mt-3">{k}</dt>
                <dd className="m-0 text-[0.97rem] break-words">{v}</dd>
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            <Option type="checkbox" label="I understand the pricing above"
              checked={f.agreePricing} onChange={() => set("agreePricing", !f.agreePricing)} />
            <Option type="checkbox" label="You may publish these details on The Harfield Hub"
              hint="Business name, description, category and contact buttons."
              checked={f.agreePublish} onChange={() => set("agreePublish", !f.agreePublish)} />
          </div>
          {errors.agree && <p className="text-[0.85rem] font-semibold mt-3" style={{ color: "#B23A2E" }}>{errors.agree}</p>}
          {fatal && <p className="text-[0.9rem] font-semibold mt-4" style={{ color: "#B23A2E" }}>{fatal}</p>}
        </>
      )}

      <div className="flex gap-3 flex-wrap mt-7 pt-5 border-t border-line">
        {step > 1 && <button className={btnGhost} onClick={back}>Back</button>}
        {step < 5 ? (
          <button className={btnPrimary + " flex-1"} onClick={next}>Continue</button>
        ) : (
          <button className={btnPrimary + " flex-1"} onClick={submit} disabled={busy}>
            {busy ? "Sending…" : "Send my listing"}
          </button>
        )}
      </div>
    </div>
  );
}
