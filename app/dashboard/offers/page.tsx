import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Field, inputCls, btnPrimary, btnGhost } from "@/components/ui";
import { OWNER_WA } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your offers — The Harfield Hub" };

async function addOffer(formData: FormData) {
  "use server";
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: biz } = await sb.from("businesses").select("id,tier")
    .eq("owner_id", user!.id).maybeSingle();
  if (!biz || biz.tier === "free") return;

  await sb.from("offers").insert({
    business_id: biz.id,
    deal: String(formData.get("deal") || "").slice(0, 120),
    fine_print: String(formData.get("fine") || "").slice(0, 200) || null,
    ends_at: String(formData.get("ends") || "") || null,
    active: true,
  });
  revalidatePath("/dashboard/offers");
  revalidatePath("/offers");
  revalidatePath("/");
}

async function removeOffer(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb.from("offers").delete().eq("id", String(formData.get("id")));
  revalidatePath("/dashboard/offers");
  revalidatePath("/offers");
  revalidatePath("/");
}

export default async function MyOffers() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  const { data: biz } = await sb.from("businesses").select("id,name,tier")
    .eq("owner_id", user!.id).maybeSingle();

  if (!biz) redirect("/dashboard");

  if (biz.tier === "free") {
    return (
      <div className="mx-auto max-w-[680px] px-5 py-14">
        <h1 className="h-display text-[2rem] mb-3">Offers are a Pro feature</h1>
        <p className="text-inkSoft mb-6">
          Post a deal any time and it goes straight to the whole village. No ad
          spend, no extra fee, as many as you like.
        </p>
        <a href={`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(
          `Hi Jack, I'd like to upgrade ${biz.name} to Pro.`)}`}
          target="_blank" rel="noopener" className={btnPrimary}>Upgrade to Pro</a>
        <p className="mt-6 text-[0.9rem]"><Link href="/dashboard">Back to your dashboard</Link></p>
      </div>
    );
  }

  const { data: offers } = await sb.from("offers")
    .select("id,deal,fine_print,ends_at").eq("business_id", biz.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-[680px] px-5 py-10">
      <p className="text-[0.9rem] text-inkSoft mb-2">
        <Link href="/dashboard">← Back to your dashboard</Link>
      </p>
      <h1 className="h-display text-[2rem] mb-1">Your offers</h1>
      <p className="text-inkSoft mb-7 text-[0.95rem]">
        These go live straight away. No waiting for approval.
      </p>

      <form action={addOffer} className="bg-surface border border-line rounded-card p-5 mb-8">
        <Field label="The deal" hint="Short and specific. This is the headline.">
          <input name="deal" required maxLength={120} className={inputCls}
            placeholder="R150 off your first service" />
        </Field>
        <Field label="The small print" hint="Optional.">
          <input name="fine" maxLength={200} className={inputCls}
            placeholder="New customers only. Weekdays." />
        </Field>
        <Field label="Runs until" hint="Optional. Leave blank if it is ongoing.">
          <input name="ends" type="date" className={inputCls} />
        </Field>
        <button className={btnPrimary} type="submit">Post this offer</button>
      </form>

      {offers && offers.length > 0 ? (
        <div className="grid gap-3">
          {offers.map((o) => (
            <div key={o.id} className="bg-surface border border-line rounded-card p-4 flex gap-3 items-start">
              <div className="flex-1">
                <strong className="font-semibold">{o.deal}</strong>
                {o.fine_print && <span className="block text-[0.85rem] text-inkSoft">{o.fine_print}</span>}
                {o.ends_at && <span className="block text-[0.8rem] text-inkSoft">Until {o.ends_at}</span>}
              </div>
              <form action={removeOffer}>
                <input type="hidden" name="id" value={o.id} />
                <button className="text-[0.85rem] underline" type="submit">Delete</button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-inkSoft text-[0.93rem]">No offers running yet.</p>
      )}
    </div>
  );
}
