import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { btnGhost } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Businesses — Admin" };

async function setStatus(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb
    .from("businesses")
    .update({ status: String(formData.get("status")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/businesses");
  revalidatePath("/");
}

async function setVerified(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb.rpc("set_verified", {
    p_business_id: String(formData.get("id")),
    p_value: formData.get("value") === "1",
  });
  revalidatePath("/admin/businesses");
  revalidatePath("/");
}

async function setTier(formData: FormData) {
  "use server";
  const sb = createClient();
  await sb
    .from("businesses")
    .update({ tier: String(formData.get("tier")) })
    .eq("id", String(formData.get("id")));
  revalidatePath("/admin/businesses");
  revalidatePath("/");
}

export default async function AdminBusinesses() {
  const sb = createClient();
  const { data } = await sb
    .from("businesses")
    .select("id,name,slug,category,whatsapp,tier,status,founding,verified,created_at")
    .order("created_at", { ascending: false });

  const list = data || [];
  const pending = list.filter((b) => b.status === "pending");
  const rest = list.filter((b) => b.status !== "pending");

  const Row = ({ b }: { b: any }) => (
    <div className="bg-surface border border-line rounded-card p-4 flex flex-wrap gap-3 items-center">
      <div className="min-w-[180px] flex-1">
        <strong className="font-semibold">{b.name}</strong>
        <span className="block text-[0.82rem] text-inkSoft">
          {b.category} · {b.whatsapp}
          {b.verified ? " · verified" : ""}
          {b.founding ? " · founding pro" : ""}
        </span>
      </div>

      <form action={setTier} className="flex gap-2 items-center">
        <input type="hidden" name="id" value={b.id} />
        <select name="tier" defaultValue={b.tier}
          className="bg-surface2 border border-line rounded-btn px-3 py-2 text-[0.85rem]">
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="expert">Expert</option>
        </select>
        <button className="text-[0.85rem] font-semibold underline" type="submit">Set tier</button>
      </form>

      <form action={setStatus} className="flex gap-2 items-center">
        <input type="hidden" name="id" value={b.id} />
        <select name="status" defaultValue={b.status}
          className="bg-surface2 border border-line rounded-btn px-3 py-2 text-[0.85rem]">
          <option value="pending">Pending</option>
          <option value="live">Live</option>
          <option value="hidden">Hidden</option>
          <option value="suspended">Suspended</option>
        </select>
        <button className="text-[0.85rem] font-semibold underline" type="submit">Set status</button>
      </form>

      <form action={setVerified}>
        <input type="hidden" name="id" value={b.id} />
        <input type="hidden" name="value" value={b.verified ? "0" : "1"} />
        <button className="text-[0.85rem] font-semibold underline" type="submit">
          {b.verified ? "Unverify" : "Verify"}
        </button>
      </form>

      {b.status === "live" && (
        <Link href={`/b/${b.slug}`} className="text-[0.85rem] underline">View</Link>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-10">
      <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
        <h1 className="h-display text-[2rem] m-0">Businesses</h1>
        <Link href="/admin/approvals" className="text-[0.92rem] font-semibold underline">
          Pages waiting for approval →
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="h-display text-[1.2rem] mb-3">
          Waiting for approval {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="text-inkSoft text-[0.92rem]">Nothing waiting.</p>
        ) : (
          <div className="grid gap-3">{pending.map((b) => <Row key={b.id} b={b} />)}</div>
        )}
      </section>

      <section>
        <h2 className="h-display text-[1.2rem] mb-3">All listings ({rest.length})</h2>
        <div className="grid gap-3">{rest.map((b) => <Row key={b.id} b={b} />)}</div>
      </section>

      <div className="mt-10">
        <form action="/auth/signout" method="post">
          <button className={btnGhost} type="submit">Log out</button>
        </form>
      </div>
    </div>
  );
}
