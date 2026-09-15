import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary } from "@/components/ui";
import { OWNER_WA } from "@/lib/config";
import PageBuilder from "@/components/PageBuilder";

export const dynamic = "force-dynamic";
export const metadata = { title: "Build your page — The Harfield Hub" };

export default async function BuildPage() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { data: biz } = await sb
    .from("businesses")
    .select("id,name,slug,tier,status")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!biz) redirect("/dashboard");

  if (biz.tier === "free") {
    return (
      <div className="mx-auto max-w-[680px] px-5 py-14">
        <h1 className="h-display text-[2rem] mb-3">Your own page is a Pro feature</h1>
        <p className="text-inkSoft mb-6">
          Pro gives you a full page with photos, your price list and unlimited
          offers. R350 a month, about R11.50 a day.
        </p>
        <a
          href={`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(
            `Hi Jack, I'd like to upgrade ${biz.name} to Pro.`
          )}`}
          target="_blank" rel="noopener" className={btnPrimary}
        >
          Upgrade to Pro
        </a>
        <p className="mt-6 text-[0.9rem]"><Link href="/dashboard">Back to your dashboard</Link></p>
      </div>
    );
  }

  const [pageRes, itemsRes] = await Promise.all([
    sb.from("pages").select("*").eq("business_id", biz.id).maybeSingle(),
    sb.from("items").select("id,name,description,price,group_name,sort_order")
      .eq("business_id", biz.id).order("sort_order"),
  ]);

  return (
    <PageBuilder
      business={biz}
      initialPage={pageRes.data}
      initialItems={itemsRes.data || []}
    />
  );
}
