import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-line">
      <div className="mx-auto max-w-[1120px] px-5 flex items-center gap-4 min-h-[60px]">
        <Link href="/" className="h-display text-[1.02rem] leading-tight no-underline">
          {SITE_NAME}
          <span className="block font-sans font-medium text-[0.72rem] text-inkSoft tracking-normal">
            Harfield Village businesses, in one place
          </span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-5 text-[0.9rem]">
          <Link href="/" className="text-inkSoft hover:text-ink">Directory</Link>
          <Link href="/offers" className="text-inkSoft hover:text-ink">Offers</Link>
          <Link href="/events" className="text-inkSoft hover:text-ink">Events</Link>
          <Link href="/join" className="text-inkSoft hover:text-ink">List your business</Link>
        </nav>
      </div>
    </header>
  );
}
