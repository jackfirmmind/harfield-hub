import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/server";
import { SUBURB } from "@/lib/config";
import Empty from "@/components/Empty";
import { prettyDate } from "@/lib/format";
import AddLink from "@/components/AddLink";

export const dynamic = "force-dynamic";
export const metadata = { title: "Events — The Harfield Hub" };

export default async function Events() {
  const sb = createPublicClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await sb
    .from("events")
    .select("id,title,detail,event_date,event_time,location,businesses!inner(name,slug,status,suburbs!inner(slug))")
    .gte("event_date", today)
    .eq("businesses.status", "live")
    .eq("businesses.suburbs.slug", SUBURB)
    .order("event_date");

  const events = (data as any[]) || [];

  return (
    <div className="mx-auto max-w-[820px] px-5 py-10">
      <div className="flex justify-between items-start gap-4 flex-wrap mb-8">
        <div>
          <h1 className="h-display text-[clamp(1.9rem,5vw,2.6rem)] mb-2">What&apos;s on in the village</h1>
          <p className="text-inkSoft m-0">Markets, classes and get-togethers.</p>
        </div>
        <AddLink href="/dashboard/events" label="Add an event" />
      </div>

      {events.length === 0 ? (
        <Empty title="Nothing on the calendar yet.">
          Listed businesses can add their markets, classes and open days.
          <div className="mt-4">
            <Link href="/join" className="inline-flex items-center min-h-[44px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline">
              List your business
            </Link>
          </div>
        </Empty>
      ) : (
        <ol className="list-none p-0 m-0 border-t border-line">
          {events.map((e) => {
            const biz = Array.isArray(e.businesses) ? e.businesses[0] : e.businesses;
            const d = prettyDate(e.event_date);
            return (
              <li key={e.id} className="flex gap-[18px] items-start py-[18px] border-b border-line">
                <div className="shrink-0 w-[58px] text-center bg-surface border border-line rounded-btn py-[7px]">
                  <span className="block h-display text-[1.3rem] leading-none">{d.d}</span>
                  <span className="block text-[0.7rem] text-inkSoft mt-[2px]">{d.m}</span>
                </div>
                <div>
                  <h2 className="h-display text-[1.08rem] m-0 mb-[3px]">{e.title}</h2>
                  <p className="text-[0.85rem] text-inkSoft m-0">
                    {biz?.name}
                    {e.event_time ? ` · ${e.event_time}` : ""}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                  {e.detail && <p className="text-[0.92rem] mt-1 m-0">{e.detail}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
