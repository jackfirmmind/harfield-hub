import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Field, inputCls, btnPrimary } from "@/components/ui";
import { OWNER_WA } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your events — The Harfield Hub" };

async function addEvent(formData: FormData) {
  "use server";
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: biz } = await sb.from("businesses").select("id,tier")
    .eq("owner_id", user!.id).maybeSingle();
  if (!biz || biz.tier === "free") return;

  await sb.from("events").insert({
    business_id: biz.id,
    title: String(formData.get("title") || "").slice(0, 120),
    detail: String(formData.get("detail") || "").slice(0, 400) || null,
    event_date: String(formData.get("date") || ""),
    event_time: String(formData.get("time") || "") || null,
    location: String(formData.get("location") || "").slice(0, 120) || null,
  });
  revalidatePath("/dashboard/events");
  revalidatePath("/events");
}

async function removeEvent(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb.from("events").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/events");
  revalidatePath("/events");
}

export default async function MyEvents() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: biz } = await sb.from("businesses").select("id,name,tier")
    .eq("owner_id", user!.id).maybeSingle();

  if (!biz) redirect("/dashboard");

  if (biz.tier === "free") {
    return (
      <div className="mx-auto max-w-[680px] px-5 py-14">
        <h1 className="h-display text-[2rem] mb-3">Events are a Pro feature</h1>
        <p className="text-inkSoft mb-6">
          Markets, classes, tastings, open days. Your event goes in front of the
          whole village.
        </p>
        <a href={`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(
          `Hi Jack, I'd like to upgrade ${biz.name} to Pro.`)}`}
          target="_blank" rel="noopener" className={btnPrimary}>Upgrade to Pro</a>
        <p className="mt-6 text-[0.9rem]"><Link href="/dashboard">Back to your dashboard</Link></p>
      </div>
    );
  }

  const { data: events } = await sb.from("events")
    .select("id,title,detail,event_date,event_time,location")
    .eq("business_id", biz.id).order("event_date");

  return (
    <div className="mx-auto max-w-[680px] px-5 py-10">
      <p className="text-[0.9rem] text-inkSoft mb-2">
        <Link href="/dashboard">← Back to your dashboard</Link>
      </p>
      <h1 className="h-display text-[2rem] mb-1">Your events</h1>
      <p className="text-inkSoft mb-7 text-[0.95rem]">
        These go live straight away. Past dates disappear on their own.
      </p>

      <form action={addEvent} className="bg-surface border border-line rounded-card p-5 mb-8">
        <Field label="What is it called">
          <input name="title" required maxLength={120} className={inputCls}
            placeholder="Saturday morning yoga" />
        </Field>
        <Field label="Date">
          <input name="date" type="date" required className={inputCls} />
        </Field>
        <Field label="Time" hint="Optional.">
          <input name="time" className={inputCls} placeholder="8am to 9am" />
        </Field>
        <Field label="Where" hint="Optional.">
          <input name="location" maxLength={120} className={inputCls} placeholder="Second Avenue" />
        </Field>
        <Field label="Detail" hint="Optional. Price, what to bring, how to book.">
          <textarea name="detail" maxLength={400} className={inputCls + " min-h-[90px]"} />
        </Field>
        <button className={btnPrimary} type="submit">Add this event</button>
      </form>

      {events && events.length > 0 ? (
        <div className="grid gap-3">
          {events.map((e) => (
            <div key={e.id} className="bg-surface border border-line rounded-card p-4 flex gap-3 items-start">
              <div className="flex-1">
                <strong className="font-semibold">{e.title}</strong>
                <span className="block text-[0.85rem] text-inkSoft">
                  {e.event_date}{e.event_time ? ` · ${e.event_time}` : ""}{e.location ? ` · ${e.location}` : ""}
                </span>
              </div>
              <form action={removeEvent}>
                <input type="hidden" name="id" value={e.id} />
                <button className="text-[0.85rem] underline" type="submit">Delete</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-inkSoft text-[0.93rem]">Nothing on your calendar yet.</p>
      )}
    </div>
  );
}
