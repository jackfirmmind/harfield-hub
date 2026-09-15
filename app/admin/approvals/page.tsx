import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { inputCls, btnPrimary, btnGhost } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Approvals — Admin" };

async function approve(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb.rpc("approve_page", { p_business_id: String(formData.get("id")) });
  revalidatePath("/admin/approvals");
  revalidatePath("/");
}

async function sendBack(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb.rpc("reject_page", {
    p_business_id: String(formData.get("id")),
    p_note: String(formData.get("note") || "Please have another look at this."),
  });
  revalidatePath("/admin/approvals");
}

export default async function Approvals() {
  const sb = createClient();

  const { data } = await sb
    .from("pages")
    .select("business_id,about,photos,logo_url,colour_primary,status,updated_at,businesses!inner(name,slug,category,one_line,tier,status)")
    .eq("status", "pending")
    .order("updated_at");

  const pending = (data as any[]) || [];

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10">
      <p className="text-[0.9rem] text-inkSoft mb-2">
        <Link href="/admin/businesses">← All businesses</Link>
      </p>
      <h1 className="h-display text-[2rem] mb-1">Pages waiting for you</h1>
      <p className="text-inkSoft mb-8 text-[0.95rem]">
        {pending.length === 0 ? "Nothing waiting." : `${pending.length} to look at.`}
      </p>

      <div className="grid gap-6">
        {pending.map((p) => {
          const b = Array.isArray(p.businesses) ? p.businesses[0] : p.businesses;
          const photos: string[] = p.photos || [];
          return (
            <article key={p.business_id} className="bg-surface border border-line rounded-card p-5">
              <div className="flex gap-3 items-start flex-wrap mb-3">
                {p.logo_url && (
                  <img src={p.logo_url} alt="" className="w-14 h-14 object-contain rounded-btn border border-line" />
                )}
                <div className="flex-1 min-w-[200px]">
                  <h2 className="h-display text-[1.25rem] m-0">{b?.name}</h2>
                  <p className="text-[0.82rem] text-inkSoft m-0">
                    {b?.category} · {b?.tier} · listing is {b?.status}
                  </p>
                </div>
                {p.colour_primary && (
                  <span className="w-8 h-8 rounded-btn border border-line" style={{ background: p.colour_primary }} />
                )}
              </div>

              <p className="text-[0.95rem] mb-3">{b?.one_line}</p>

              {p.about && (
                <p className="text-[0.93rem] whitespace-pre-line bg-surface2 rounded-btn p-3 mb-3">{p.about}</p>
              )}

              {photos.length > 0 && (
                <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(110px,1fr))] mb-4">
                  {photos.map((src) => (
                    <img key={src} src={src} alt="" className="w-full h-24 object-cover rounded-btn border border-line" />
                  ))}
                </div>
              )}

              <div className="flex gap-3 flex-wrap items-start pt-3 border-t border-line">
                <form action={approve}>
                  <input type="hidden" name="id" value={p.business_id} />
                  <button className={btnPrimary} type="submit">Approve and publish</button>
                </form>
                <form action={sendBack} className="flex gap-2 flex-1 min-w-[260px]">
                  <input type="hidden" name="id" value={p.business_id} />
                  <input name="note" className={inputCls + " flex-1 py-2"} placeholder="What needs changing?" />
                  <button className={btnGhost} type="submit">Send back</button>
                </form>
                <Link href={`/b/${b?.slug}`} className="text-[0.88rem] underline self-center">Preview</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
