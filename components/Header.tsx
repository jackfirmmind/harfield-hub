import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SITE_NAME } from "@/lib/config";

export default async function Header() {
  const sb = createClient();
  const { data: { user } } = await sb.auth.getUser();

  let role: string | null = null;
  if (user) {
    const { data } = await sb.from("profiles").select("role").eq("id", user.id).maybeSingle();
    role = data?.role ?? null;
  }

  const isStaff = role === "admin" || role === "operator";

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="mx-auto max-w-[1120px] px-5 flex items-center gap-4 min-h-[60px]">
        <Link href="/" className="h-display text-[1.02rem] leading-tight no-underline shrink-0">
          {SITE_NAME}
          <span className="block font-sans font-medium text-[0.72rem] text-inkSoft tracking-normal">
            Harfield Village businesses, in one place
          </span>
        </Link>

        <nav className="ml-auto hidden md:flex items-center gap-5 text-[0.9rem]">
          <Link href="/" className="text-inkSoft hover:text-ink">Directory</Link>
          <Link href="/offers" className="text-inkSoft hover:text-ink">Offers</Link>
          <Link href="/events" className="text-inkSoft hover:text-ink">Events</Link>
          {isStaff && (
            <Link href="/admin/approvals" className="text-inkSoft hover:text-ink font-semibold">
              Admin
            </Link>
          )}
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center min-h-[40px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-inkSoft hover:text-ink">Log in</Link>
              <Link
                href="/join"
                className="inline-flex items-center min-h-[40px] px-4 rounded-btn bg-primary text-onPrimary font-semibold no-underline"
              >
                List your business
              </Link>
            </>
          )}
        </nav>

        {/* mobile: one button only, the tab bar covers the rest */}
        <div className="ml-auto md:hidden">
          {user ? (
            <Link
              href={isStaff ? "/admin/approvals" : "/dashboard"}
              className="inline-flex items-center min-h-[40px] px-3 rounded-btn bg-primary text-onPrimary text-[0.85rem] font-semibold no-underline"
            >
              {isStaff ? "Admin" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center min-h-[40px] px-3 rounded-btn border-[1.5px] border-line text-[0.85rem] font-semibold no-underline"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
