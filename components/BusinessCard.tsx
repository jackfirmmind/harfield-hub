import Link from "next/link";
import type { BusinessRow } from "@/lib/types";
import ContactButtons from "./ContactButtons";
import { VerifiedBadge, Stars } from "./Badges";

export default function BusinessCard({ b }: { b: BusinessRow }) {
  return (
    <article
      className={
        "relative bg-surface rounded-card p-5 flex flex-col gap-[10px] " +
        (b.tier === "expert" ? "border-2 border-accent" : "border border-line")
      }
    >
      {b.tier === "expert" && (
        <span className="absolute -top-px right-4 bg-accent text-accentInk text-[0.7rem] font-bold uppercase tracking-wider px-2 py-1 rounded-b-[7px]">
          Featured
        </span>
      )}

      {b.photo && (
        <img src={b.photo} alt="" loading="lazy"
          className="w-full h-40 object-cover rounded-[10px] -mt-1" />
      )}

      <div>
        <h3 className="h-display text-[1.12rem] leading-tight m-0">
          {b.has_page ? (
            <Link href={`/b/${b.slug}`} className="no-underline hover:underline">{b.name}</Link>
          ) : b.name}
        </h3>
        <p className="text-[0.78rem] text-inkSoft mt-[2px] m-0">{b.category}</p>
      </div>

      {(b.verified || b.rating) && (
        <div className="flex items-center gap-3 flex-wrap">
          {b.verified && <VerifiedBadge small />}
          <Stars value={b.rating} count={Number(b.review_count || 0)} small />
        </div>
      )}

      <p className="text-[0.95rem] m-0">{b.one_line}</p>

      {b.starting_price && (
        <p className="text-[0.82rem] font-semibold text-primary m-0">{b.starting_price}</p>
      )}

      <div className="mt-auto pt-3 flex gap-2 items-center flex-wrap">
        <ContactButtons id={b.id} name={b.name} whatsapp={b.whatsapp} phone={b.phone} />
        {b.has_offer && (
          <Link href="/offers"
            className="bg-accent text-accentInk text-[0.82rem] font-bold px-3 min-h-[44px] inline-flex items-center rounded-btn no-underline">
            Offer on
          </Link>
        )}
      </div>
    </article>
  );
}
