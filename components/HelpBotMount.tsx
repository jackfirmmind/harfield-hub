import { createClient } from "@/lib/supabase/server";
import HelpBot from "./HelpBot";
import type { BotCtx } from "@/lib/botTypes";

/** Works out who is asking, then hands that context to the bot. */
export default async function HelpBotMount() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  let ctx: BotCtx = { role: "guest" };

  if (user) {
    const { data: profile } = await sb
      .from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();

    const role = profile?.role;
    ctx = {
      role: role === "admin" || role === "operator" ? "admin" : role === "business" ? "business" : "resident",
      name: profile?.full_name || null,
    };

    if (ctx.role === "business" || ctx.role === "admin") {
      const { data: biz } = await sb
        .from("businesses")
        .select("id,name,slug,tier,status,verified,trial_ends_at")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (biz) {
        const since = new Date(Date.now() - 30 * 864e5).toISOString();
        const [actRes, pageRes, offRes, revRes] = await Promise.all([
          sb.from("activity").select("type").eq("business_id", biz.id).gte("created_at", since),
          sb.from("pages").select("status, admin_note").eq("business_id", biz.id).maybeSingle(),
          sb.from("offers").select("id").eq("business_id", biz.id).eq("active", true),
          sb.from("reviews").select("rating").eq("business_id", biz.id).eq("status", "visible"),
        ]);

        const acts = actRes.data || [];
        const ratings = (revRes.data || []).map((r: any) => r.rating as number);

        ctx = {
          ...ctx,
          role: ctx.role === "admin" ? "admin" : "business",
          businessName: biz.name,
          slug: biz.slug,
          tier: biz.tier,
          status: biz.status,
          verified: biz.verified,
          trialEndsAt: biz.trial_ends_at,
          pageStatus: pageRes.data?.status ?? null,
          adminNote: pageRes.data?.admin_note ?? null,
          views: acts.filter((a) => a.type === "view" || a.type === "page_view").length,
          msgs: acts.filter((a) => a.type === "whatsapp_tap").length,
          offers: (offRes.data || []).length,
          reviews: ratings.length,
          rating: ratings.length
            ? Math.round((ratings.reduce((n, r) => n + r, 0) / ratings.length) * 10) / 10
            : null,
        };
      }
    }
  }

  return <HelpBot ctx={ctx} />;
}
