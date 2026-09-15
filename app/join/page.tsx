import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { SUBURB } from "@/lib/config";
import { WaIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "List your business — The Harfield Hub",
  description:
    "Get found by your neighbours in Harfield Village. Free listing, or your own page from R350 a month.",
};

const WA = "/join/apply";

const FOUNDING_SLOTS = 15;

export default async function Join() {
  const sb = createPublicClient();

  const [foundingRes, liveRes] = await Promise.all([
    sb.from("businesses").select("id", { count: "exact", head: true }).eq("founding", true),
    sb
      .from("businesses")
      .select("name, suburbs!inner(slug)")
      .eq("status", "live")
      .eq("suburbs.slug", SUBURB)
      .limit(3),
  ]);

  const taken = foundingRes.count ?? 0;
  const left = Math.max(FOUNDING_SLOTS - taken, 0);
  const names = ((liveRes.data as any[]) || []).map((b) => b.name);
  const liveCount = names.length;

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-10">
      {/* scarcity, stated once, at the top */}
      <p className="inline-block bg-accent text-accentInk font-bold text-[0.85rem] px-[13px] py-2 rounded-full mb-4">
        {left > 0
          ? `${left} of ${FOUNDING_SLOTS} founding places left · price locked for 12 months`
          : "Founding places are full · Pro is now R450 a month"}
      </p>

      <h1 className="h-display text-[clamp(1.9rem,5.5vw,2.9rem)] leading-[1.04] mb-4 max-w-[20ch]">
        When a neighbour needs what you do, be the one they find.
      </h1>

      <p className="text-inkSoft text-[1.05rem] max-w-[54ch] mb-2">
        Residents of Harfield Village open the Hub to find a plumber, a physio,
        a tutor, a place to eat. Not Google. Not a Facebook thread from last year.
      </p>
      <p className="text-inkSoft max-w-[54ch] mb-9">
        We launch on 3 October.
        {liveCount > 0 && (
          <>
            {" "}
            {names.join(", ")}
            {liveCount >= 3 ? " and others are" : " is"} already listed.
          </>
        )}
      </p>

      {/* tiers */}
      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(272px,1fr))] items-start">
        {/* FREE */}
        <div className="rounded-card p-6 bg-surface border border-line flex flex-col">
          <h2 className="h-display text-[1.45rem] m-0">Get found</h2>
          <p className="text-[0.85rem] text-inkSoft mt-1 mb-4">Free</p>
          <p className="h-display text-[2.4rem] leading-none m-0">R0</p>
          <p className="text-[0.85rem] text-inkSoft mt-1 mb-5">Always free. No card needed.</p>
          <p className="text-[0.95rem] mb-4">
            Your name, what you do, and a WhatsApp button. Residents reach you in two taps.
          </p>
          <ul className="list-none p-0 m-0 grid gap-2 text-[0.93rem]">
            {[
              "Your listing in the directory",
              "WhatsApp and call buttons",
              "You appear in every search",
              "See how many people viewed and messaged you",
            ].map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-primary" aria-hidden="true">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* PRO */}
        <div className="rounded-card p-6 bg-primary text-onPrimary flex flex-col relative">
          <span className="absolute -top-3 left-6 bg-accent text-accentInk text-[0.7rem] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
            Most businesses pick this
          </span>
          <h2 className="h-display text-[1.45rem] m-0 mt-2">Get chosen</h2>
          <p className="text-[0.85rem] opacity-85 mt-1 mb-4">Pro</p>
          <div className="flex items-end gap-2">
            <p className="h-display text-[2.7rem] leading-none m-0">R350</p>
            <p className="text-[1rem] line-through opacity-60 m-0 mb-1">R450</p>
          </div>
          <p className="text-[0.85rem] opacity-85 mt-1 mb-1">a month, founding price</p>
          <p className="text-[0.85rem] opacity-85 mb-5">
            That is R11.50 a day. One job pays for three months.
          </p>
          <p className="text-[0.95rem] mb-4">
            Your own page with photos, prices and offers. When someone is
            choosing between you and a name with no photo, you win.
          </p>
          <ul className="list-none p-0 m-0 grid gap-2 text-[0.93rem]">
            {[
              "Everything in Free",
              "Your own page with photos",
              "Your menu, services or price list",
              "Unlimited special offers",
              "List your events and classes",
              "Ranked above every free listing",
            ].map((p) => (
              <li key={p} className="flex gap-2">
                <span aria-hidden="true">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <a
            href={WA}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center justify-center gap-2 min-h-[50px] rounded-btn bg-accent text-accentInk font-bold no-underline"
          >
            <WaIcon /> {left > 0 ? `Claim one of ${left} places` : "Join at R450"}
          </a>
        </div>

        {/* EXPERT */}
        <div className="rounded-card p-6 bg-surface border border-line flex flex-col">
          <h2 className="h-display text-[1.45rem] m-0">Get seen first</h2>
          <p className="text-[0.85rem] text-inkSoft mt-1 mb-4">Expert</p>
          <p className="h-display text-[2.4rem] leading-none m-0">R1200</p>
          <p className="text-[0.85rem] text-inkSoft mt-1 mb-5">a month</p>
          <p className="text-[0.95rem] mb-4">
            Top of your category, above everyone else. Only three businesses per
            category, ever.
          </p>
          <ul className="list-none p-0 m-0 grid gap-2 text-[0.93rem]">
            {[
              "Everything in Pro",
              "Top of your category, 3 places only",
              "Payment links in your listing",
              "One business coaching session a month",
              "Fresh photos every quarter",
            ].map((p) => (
              <li key={p} className="flex gap-2">
                <span className="text-primary" aria-hidden="true">✓</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* the maths, plainly */}
      <div className="mt-10 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {[
          { h: "R11.50 a day", p: "One callout, one table of four, one haircut. That is your whole month covered." },
          { h: "Nothing to build", p: "Send us your photos and your price list on WhatsApp. We build your page for you." },
          { h: "Cancel any time", p: "No contract. Stop whenever you like and keep your free listing." },
        ].map((x) => (
          <div key={x.h} className="bg-surface2 rounded-card p-5">
            <h3 className="h-display text-[1.05rem] m-0 mb-1">{x.h}</h3>
            <p className="text-[0.92rem] text-inkSoft m-0">{x.p}</p>
          </div>
        ))}
      </div>

      {/* close */}
      <div className="mt-10 bg-surface rounded-card border border-line p-6">
        <h2 className="h-display text-[1.3rem] m-0 mb-2">
          {left > 0 ? `${left} founding places left` : "Get listed"}
        </h2>
        <p className="m-0 text-[0.95rem] text-inkSoft max-w-[50ch]">
          {left > 0
            ? "Founding members pay R350 a month for a full year, even when the price goes up. Once these are gone they are gone."
            : "Takes about five minutes. No card needed for a free listing."}
        </p>
        <a
          href={WA}
          target="_blank"
          rel="noopener"
          className="mt-5 inline-flex items-center gap-2 min-h-[50px] px-6 rounded-btn bg-primary text-onPrimary font-semibold no-underline"
        >
          Start your listing
        </a>
        <p className="text-[0.85rem] text-inkSoft mt-4 mb-0">
          Jack Moss, Durham Street. Questions? WhatsApp 079 819 6014.
        </p>
      </div>

      <p className="mt-8 text-[0.88rem] text-inkSoft">
        <Link href="/">Back to the directory</Link>
      </p>
    </div>
  );
}
