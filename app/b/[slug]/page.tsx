import { notFound } from "next/navigation";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { SUBURB } from "@/lib/config";
import ContactButtons from "@/components/ContactButtons";
import PageView from "@/components/PageView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const sb = createPublicClient();
  const { data } = await sb
    .from("businesses")
    .select("name, one_line")
    .eq("slug", params.slug)
    .eq("status", "live")
    .maybeSingle();
  if (!data) return { title: "Not found" };
  return { title: `${data.name} — The Harfield Hub`, description: data.one_line };
}

export default async function BusinessPage({ params }: { params: { slug: string } }) {
  const sb = createPublicClient();

  const { data: b } = await sb
    .from("businesses")
    .select("id,name,category,one_line,whatsapp,phone,street,hours,starting_price,works_from,tier,website_or_social,suburb_id")
    .eq("slug", params.slug)
    .eq("status", "live")
    .maybeSingle();

  if (!b) notFound();

  const [pageRes, itemsRes, offersRes, eventsRes] = await Promise.all([
    sb.from("pages").select("about,photos,logo_url").eq("business_id", b.id).eq("status", "live").maybeSingle(),
    sb.from("items").select("name,description,price,group_name").eq("business_id", b.id).order("sort_order"),
    sb.from("offers").select("deal,fine_print,ends_at").eq("business_id", b.id).eq("active", true),
    sb.from("events").select("title,detail,event_date,event_time,location").eq("business_id", b.id).gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date"),
  ]);

  const page = pageRes.data as { about: string | null; photos: string[] | null; logo_url: string | null } | null;
  const items = itemsRes.data || [];
  const offers = offersRes.data || [];
  const events = eventsRes.data || [];
  const photos: string[] = (page?.photos as string[]) || [];

  const worksFrom: Record<string, string> = {
    customers_come_to_me: "Customers come to them",
    i_travel: "Travels to you",
    both: "You can visit, or they come to you",
    online: "Online only",
  };

  return (
    <>
      <PageView businessId={b.id} />

      <div className="mx-auto max-w-[820px] px-5 py-10">
        <Link href="/" className="text-[0.9rem] text-inkSoft no-underline">
          ← Back to the directory
        </Link>

        <h1 className="h-display text-[clamp(1.9rem,5.5vw,2.8rem)] leading-[1.05] mt-4 mb-2">
          {b.name}
        </h1>
        <p className="text-inkSoft m-0">{b.category}</p>
        <p className="text-[1.05rem] mt-4">{b.one_line}</p>

        <div className="mt-6">
          <ContactButtons id={b.id} name={b.name} whatsapp={b.whatsapp} phone={b.phone} />
        </div>

        {offers.length > 0 && (
          <section className="mt-9">
            <h2 className="h-display text-[1.35rem] mb-3">Current offers</h2>
            <div className="grid gap-3">
              {offers.map((o, i) => (
                <div key={i} className="bg-accent text-accentInk rounded-card p-5">
                  <p className="h-display text-[1.15rem] m-0">{o.deal}</p>
                  {o.fine_print && <p className="text-[0.85rem] mt-1 mb-0 opacity-80">{o.fine_print}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {photos.length > 0 && (
          <section className="mt-9 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
            {photos.map((src, i) => (
              <img key={i} src={src} alt="" loading="lazy" className="w-full h-48 object-cover rounded-card" />
            ))}
          </section>
        )}

        {page?.about && (
          <section className="mt-9">
            <h2 className="h-display text-[1.35rem] mb-3">About</h2>
            <p className="whitespace-pre-line m-0">{page.about}</p>
          </section>
        )}

        {items.length > 0 && (
          <section className="mt-9">
            <h2 className="h-display text-[1.35rem] mb-3">Services and prices</h2>
            <ul className="list-none p-0 m-0 border-t border-line">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between gap-4 py-3 border-b border-line">
                  <span>
                    <strong className="font-semibold">{it.name}</strong>
                    {it.description && <span className="block text-[0.88rem] text-inkSoft">{it.description}</span>}
                  </span>
                  {it.price && <span className="font-semibold whitespace-nowrap">{it.price}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {events.length > 0 && (
          <section className="mt-9">
            <h2 className="h-display text-[1.35rem] mb-3">Coming up</h2>
            <ul className="list-none p-0 m-0 border-t border-line">
              {events.map((e, i) => (
                <li key={i} className="py-3 border-b border-line">
                  <strong className="font-semibold">{e.title}</strong>
                  <span className="block text-[0.88rem] text-inkSoft">
                    {e.event_date}
                    {e.event_time ? ` · ${e.event_time}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </span>
                  {e.detail && <span className="block text-[0.9rem] mt-1">{e.detail}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-9 bg-surface2 rounded-card p-5 grid gap-2 text-[0.95rem]">
          {b.hours && <p className="m-0"><strong>Hours:</strong> {b.hours}</p>}
          {b.street && <p className="m-0"><strong>In the village:</strong> {b.street}</p>}
          {b.works_from && <p className="m-0">{worksFrom[b.works_from] || b.works_from}</p>}
          {b.starting_price && <p className="m-0"><strong>From:</strong> {b.starting_price}</p>}
          {b.website_or_social && <p className="m-0 break-words"><strong>Online:</strong> {b.website_or_social}</p>}
        </section>
      </div>
    </>
  );
}
