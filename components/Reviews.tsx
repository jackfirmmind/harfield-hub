"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Stars } from "./Badges";
import { inputCls, btnPrimary, btnGhost } from "./ui";

type Review = { id: string; rating: number; body: string | null; created_at: string; author: string; is_mine: boolean };

export default function Reviews({ businessId, businessName }: { businessId: string; businessName: string }) {
  const sb = createClient();
  const [list, setList] = useState<Review[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await sb.rpc("business_reviews", { p_business_id: businessId });
    setList((data as Review[]) || []);
  }

  useEffect(() => {
    load();
    sb.auth.getUser().then(async ({ data }) => {
      setMe(data.user?.id ?? null);
      if (data.user) {
        const { data: b } = await sb.from("businesses").select("id").eq("id", businessId)
          .eq("owner_id", data.user.id).maybeSingle();
        setIsOwner(!!b);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [businessId]);

  const mine = list.find((r) => r.is_mine);
  const avg = list.length ? list.reduce((n, r) => n + r.rating, 0) / list.length : null;

  async function submit() {
    if (!rating) { setErr("Pick a rating first."); return; }
    setBusy(true); setErr("");
    const { error } = await sb.from("reviews").upsert(
      { business_id: businessId, user_id: me, rating, body: body.trim() || null },
      { onConflict: "business_id,user_id" }
    );
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setOpen(false); setBody(""); setRating(0);
    load();
  }

  async function remove(id: string) {
    await sb.from("reviews").delete().eq("id", id);
    load();
  }

  return (
    <section className="mt-9">
      <div className="flex items-baseline gap-3 flex-wrap mb-4">
        <h2 className="h-display text-[1.35rem] m-0">What neighbours say</h2>
        {avg && <Stars value={Math.round(avg * 10) / 10} count={list.length} />}
      </div>

      {list.length === 0 && (
        <p className="text-inkSoft text-[0.93rem] mb-4">
          No reviews yet. If you have used {businessName}, you can be the first.
        </p>
      )}

      <div className="grid gap-3 mb-5">
        {list.map((r) => (
          <div key={r.id} className="bg-surface border border-line rounded-card p-4">
            <div className="flex justify-between gap-3 items-start">
              <div>
                <Stars value={r.rating} small />
                <p className="text-[0.85rem] text-inkSoft m-0 mt-1">
                  {r.author} · {new Date(r.created_at).toLocaleDateString("en-ZA")}
                </p>
              </div>
              {r.is_mine && (
                <button onClick={() => remove(r.id)} className="text-[0.82rem] underline">Delete</button>
              )}
            </div>
            {r.body && <p className="text-[0.95rem] mt-2 m-0 whitespace-pre-line">{r.body}</p>}
          </div>
        ))}
      </div>

      {isOwner ? (
        <p className="text-[0.88rem] text-inkSoft">
          You cannot review your own business. If a review is unfair, message Jack and he will look at it.
        </p>
      ) : !me ? (
        <p className="text-[0.92rem]">
          <Link href="/login">Log in</Link> or <Link href="/signup/resident">create an account</Link> to leave a review.
          Your name shows on it.
        </p>
      ) : !open ? (
        <button className={btnGhost} onClick={() => {
          setOpen(true);
          if (mine) { setRating(mine.rating); setBody(mine.body || ""); }
        }}>
          {mine ? "Change your review" : "Write a review"}
        </button>
      ) : (
        <div className="bg-surface border border-line rounded-card p-5">
          <p className="font-semibold text-[0.95rem] mb-2">Your rating</p>
          <div className="flex gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} aria-label={`${n} out of 5`}
                className="w-11 h-11 grid place-items-center">
                <svg width="26" height="26" viewBox="0 0 24 24"
                  style={{ color: n <= rating ? "var(--accent)" : "var(--line)" }}>
                  <path fill="currentColor" d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8Z" />
                </svg>
              </button>
            ))}
          </div>
          <textarea className={inputCls + " min-h-[90px]"} maxLength={600} value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What was it like? Keep it fair and about your own experience." />
          {err && <p className="text-[0.88rem] font-semibold mt-2" style={{ color: "#B23A2E" }}>{err}</p>}
          <div className="flex gap-3 mt-4 flex-wrap">
            <button className={btnPrimary} onClick={submit} disabled={busy}>
              {busy ? "Posting…" : "Post review"}
            </button>
            <button className={btnGhost} onClick={() => setOpen(false)}>Cancel</button>
          </div>
          <p className="text-[0.82rem] text-inkSoft mt-3 m-0">
            Your name shows publicly. One review per business. You can change or delete it later.
          </p>
        </div>
      )}
    </section>
  );
}
