import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { SUBURB } from "@/lib/config";
import type { BusinessRow } from "@/lib/types";
import BusinessCard from "@/components/BusinessCard";
import CategoryChips from "@/components/CategoryChips";
import SearchBar from "@/components/SearchBar";
import Empty from "@/components/Empty";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const q = searchParams.q?.trim() || "";
  const cat = searchParams.cat || "";
  const sb = createPublicClient();

  const [listRes, catRes] = await Promise.all([
    sb.rpc("search_businesses", {
      p_suburb: SUBURB,
      p_query: q || null,
      p_category: cat || null,
    }),
    sb.rpc("live_categories", { p_suburb: SUBURB }),
  ]);

  const list: BusinessRow[] = (listRes.data as BusinessRow[]) || [];
  const categories = (catRes.data as { category: string; count: number }[]) || [];
  const total = categories.reduce((n, c) => n + Number(c.count), 0);
  const filtering = Boolean(q || cat);

  return (
    <>
      <div className="mx-auto max-w-[1120px] px-5 pt-10">
        <h1 className="h-display text-[clamp(2rem,6vw,3.5rem)] leading-[1.03] max-w-[17ch] mb-3">
          Everything in the village, in one place.
        </h1>
        <p className="text-inkSoft text-[1.02rem] max-w-[52ch] mb-6">
          Shops, trades and services right here in Harfield Village. Search what
          you need and message them straight on WhatsApp.
        </p>

        <div className="flex gap-[10px] flex-wrap items-center">
          <Suspense fallback={<div className="h-[54px] flex-1" />}>
            <SearchBar initial={q} />
          </Suspense>
          <p className="text-[0.9rem] text-inkSoft whitespace-nowrap m-0">
            {filtering
              ? `${list.length} of ${total} businesses`
              : `${total} ${total === 1 ? "business" : "businesses"} listed`}
          </p>
        </div>

        <CategoryChips categories={categories} active={cat} q={q} />
      </div>

      <section className="mx-auto max-w-[1120px] px-5 pt-8 pb-14">
        {list.length > 0 ? (
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
            {list.map((b) => (
              <BusinessCard key={b.id} b={b} />
            ))}
          </div>
        ) : total === 0 ? (
          <Empty title="The directory is being built right now.">
            Businesses are being added ahead of our launch on 3 October.
            <div className="mt-4">
              <Link
                href="/join"
                className="inline-flex items-center min-h-[44px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline"
              >
                List your business
              </Link>
            </div>
          </Empty>
        ) : (
          <Empty title="Nothing matches that yet.">
            Try a shorter word, or clear the filters.
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center min-h-[44px] px-4 rounded-btn bg-surface border-[1.5px] border-line font-semibold no-underline"
              >
                Show all businesses
              </Link>
            </div>
          </Empty>
        )}
      </section>
    </>
  );
}
