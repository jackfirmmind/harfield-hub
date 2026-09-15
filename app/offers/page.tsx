import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { SUBURB, SITE_NAME } from "@/lib/config";
import Empty from "@/components/Empty";
import { waLink } from "@/lib/format";
import { WaIcon } from "@/components/Icons";
import AddLink from "@/components/AddLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Offers — The Harfield Hub" };

export default async function Offers() {
  const sb = createPublicClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("offers")
    .select("id,deal,fine_print,ends_at,businesses!inner(name,slug,whatsapp,status,suburbs!inner(slug))")
    .eq("active", true)
    .eq("businesses.status", "live")
    .eq("businesses.suburbs.slug", SUBURB)
    .or(`ends_at.is.null,ends_at.gte.${today}`)
    .order("created_at", { ascending: false });

  const offers = (data as any[]) || [];

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-10">
      <div className="flex justify-between items-start gap-4 flex-wrap mb-8">
        <div>
          <h1 className="h-display text-[clamp(1.9rem,5vw,2.6rem)] mb-2">Village offers</h1>
          <p className="text-inkSoft m-0">Deals from businesses in Harfield Village.</p>
        </div>
        <AddLink href="/dashboard/offers" label="Add an offer" />
      </div>

      {offers.length === 0 ? (
        <Empty title="No offers running right now.">
          Listed businesses can post a deal any time, at no extra cost.
          <div className="mt-4">
            <Link href="/join" className="inline-flex items-center min-h-[44px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline">
              List your business
            </Link>
          </div>
        </Empty>
      ) : (
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
          {offers.map((o) => {
            const biz = Array.isArray(o.businesses) ? o.businesses[0] : o.businesses;
            return (
              <article key={o.id} className="bg-surface border border-line rounded-card p-5 flex flex-col gap-2">
                <p className="text-[0.8rem] text-inkSoft m-0">{biz?.name}</p>
                <h2 className="h-display text-[1.18rem] leading-tight m-0">{o.deal}</h2>
                {o.ends_at && <p className="text-[0.78rem] font-semibold m-0">Until {o.ends_at}</p>}
                {o.fine_print && <p className="text-[0.85rem] text-inkSoft m-0">{o.fine_print}</p>}
                <a
                  href={waLink(biz?.whatsapp || "", `Hi ${biz?.name}, I saw your offer on ${SITE_NAME}: ${o.deal}`)}
                  target="_blank"
                  rel="noopener"
                  className="mt-auto inline-flex items-center justify-center gap-2 min-h-[48px] rounded-btn bg-primary text-onPrimary font-semibold no-underline"
                >
                  <WaIcon /> Message them
                </a>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
