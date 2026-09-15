import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

/** A plus button, shown only to someone who owns a business here. */
export default async function AddLink({ href, label }: { href: string; label: string }) {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: biz } = await sb
    .from("businesses").select("id,tier").eq("owner_id", user.id).maybeSingle();
  if (!biz) return null;

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 min-h-[46px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline shrink-0"
    >
      <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="none"
        stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      {label}
    </Link>
  );
}
