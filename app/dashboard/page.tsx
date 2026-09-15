import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { btnPrimary, btnGhost } from "@/components/ui";
import { OWNER_WA } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your dashboard — The Harfield Hub" };

const STATUS_TEXT: Record<string, string> = {
  pending: "Waiting for approval. It is not on the directory yet.",
  live: "Live in the directory.",
  hidden: "Hidden. Get in touch to bring it back.",
  suspended: "Suspended. Get in touch.",
};

export default async function Dashboard({
  searchParams,
}: { searchParams: { welcome?: string; upgrade?: string } }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  const { data: me } = await sb
    .from("profiles").select("role").eq("id", user!.id).maybeSingle();
  const isStaff = me?.role === "admin" || me?.role === "operator";

  const { data: biz } = await sb
    .from("businesses")
    .select("id,name,slug,category,tier,status,founding,founding_listing,locked_price,trial_ends_at")
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!biz) {
    return (
      <div className="mx-auto max-w-[680px] px-5 py-14">
        <h1 className="h-display text-[2rem] mb-3">You are signed in</h1>
        <p className="text-inkSoft mb-6">
          This account has no business listing attached to it.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/join/apply" className={btnPrimary}>List a business</Link>
          {isStaff && <Link href="/admin/businesses" className={btnGhost}>Go to admin</Link>}
          <Link href="/" className={btnGhost}>Back to the directory</Link>
        </div>
      </div>
    );
  }

  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const { data: acts } = await sb
    .from("activity").select("type").eq("business_id", biz.id).gte("created_at", since);

  const rows = acts || [];
  const count = (t: string) => rows.filter((r) => r.type === t).length;
  const views = count("view") + count("page_view");
  const msgs = count("whatsapp_tap");
  const calls = count("call_tap");
  const saves = count("save");

  return (
    <div className="mx-auto max-w-[820px] px-5 py-10">
      {searchParams.welcome && (
        <div className="bg-surface2 border border-line rounded-card p-5 mb-7">
          <h2 className="h-display text-[1.1rem] m-0 mb-1">You are in.</h2>
          <p className="m-0 text-[0.94rem] text-inkSoft">
            Your listing is being reviewed and should be live within 24 hours.
          </p>
        </div>
      )}
      {searchParams.upgrade && (
        <div className="bg-accent text-accentInk rounded-card p-5 mb-7">
          <h2 className="h-display text-[1.1rem] m-0 mb-1">One more step.</h2>
          <p className="m-0 text-[0.94rem]">
            Payment is not switched on yet. WhatsApp Jack on 079 819 6014 and he
            will set up your page and billing.
          </p>
        </div>
      )}

      <h1 className="h-display text-[2rem] mb-1">{biz.name}</h1>
      <p className="text-inkSoft text-[0.92rem] mb-1">{biz.category}</p>
      <p className="text-[0.92rem] mb-8">{STATUS_TEXT[biz.status]}</p>

      <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] mb-8">
        {[
          { n: views, l: "Times you appeared" },
          { n: msgs, l: "WhatsApp messages" },
          { n: calls, l: "Calls" },
          { n: saves, l: "Saved you" },
        ].map((s) => (
          <div key={s.l} className="bg-surface border border-line rounded-card p-5">
            <p className="h-display text-[2.2rem] leading-none m-0">{s.n}</p>
            <p className="text-[0.85rem] text-inkSoft mt-2 m-0">{s.l}</p>
          </div>
        ))}
      </div>
      <p className="text-[0.85rem] text-inkSoft -mt-5 mb-9">Last 30 days.</p>

      {biz.tier === "free" && (
        <div className="bg-primary text-onPrimary rounded-card p-6 mb-8">
          <h2 className="h-display text-[1.3rem] m-0 mb-2">
            {views > 0
              ? `You appeared ${views} times. ${msgs} people messaged you.`
              : "Your listing is up. Now make it worth finding."}
          </h2>
          <p className="text-[0.95rem] opacity-90 m-0 mb-4">
            Listings with photos and prices get chosen far more often than a name
            on its own. Pro gives you your own page, unlimited offers and a place
            above every free listing. R350 a month, about R11.50 a day.
          </p>
          <a
            href={`https://wa.me/${OWNER_WA}?text=${encodeURIComponent(
              `Hi Jack, I'd like to upgrade ${biz.name} to Pro on The Harfield Hub.`
            )}`}
            target="_blank" rel="noopener"
            className="inline-flex items-center min-h-[48px] px-6 rounded-btn bg-accent text-accentInk font-bold no-underline"
          >
            Upgrade to Pro
          </a>
        </div>
      )}

      {biz.founding_listing && (
        <p className="text-[0.9rem] text-inkSoft mb-3">
          Founding listing. Free forever as one of the first 30 businesses in the village.
        </p>
      )}
      {biz.founding && biz.locked_price && (
        <p className="text-[0.9rem] text-inkSoft mb-3">
          Founding Pro member. R{biz.locked_price} a month locked for twelve months.
        </p>
      )}
      {biz.trial_ends_at && (
        <p className="text-[0.9rem] text-inkSoft mb-3">
          Free until {new Date(biz.trial_ends_at).toLocaleDateString("en-ZA")}.
        </p>
      )}

      {biz.tier !== "free" && (
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))] mb-8">
          <Link href="/dashboard/page" className="bg-surface border border-line rounded-card p-5 no-underline">
            <strong className="h-display text-[1.05rem] block mb-1">Your page</strong>
            <span className="text-[0.88rem] text-inkSoft">Photos, about, price list</span>
          </Link>
          <Link href="/dashboard/offers" className="bg-surface border border-line rounded-card p-5 no-underline">
            <strong className="h-display text-[1.05rem] block mb-1">Your offers</strong>
            <span className="text-[0.88rem] text-inkSoft">Post a deal, live straight away</span>
          </Link>
          <Link href="/dashboard/events" className="bg-surface border border-line rounded-card p-5 no-underline">
            <strong className="h-display text-[1.05rem] block mb-1">Your events</strong>
            <span className="text-[0.88rem] text-inkSoft">Markets, classes, open days</span>
          </Link>
        </div>
      )}

      <div className="flex gap-3 flex-wrap mt-8">
        {isStaff && (
          <>
            <Link href="/admin/approvals" className={btnPrimary}>Approvals</Link>
            <Link href="/admin/businesses" className={btnGhost}>All businesses</Link>
          </>
        )}
        {biz.status === "live" && (
          <Link href={`/b/${biz.slug}`} className={btnGhost}>View your listing</Link>
        )}
        <form action="/auth/signout" method="post">
          <button className={btnGhost} type="submit">Log out</button>
        </form>
      </div>
    </div>
  );
}
