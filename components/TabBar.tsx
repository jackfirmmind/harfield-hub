import Link from "next/link";
import { SearchIcon, TagIcon, CalIcon, PinIcon } from "./Icons";

const tabs = [
  { href: "/", label: "Search", Icon: SearchIcon },
  { href: "/offers", label: "Offers", Icon: TagIcon },
  { href: "/events", label: "Events", Icon: CalIcon },
  { href: "/join", label: "Join", Icon: PinIcon },
];

export default function TabBar() {
  return (
    <div className="md:hidden fixed left-0 right-0 bottom-0 z-50 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]">
      <nav className="grid grid-cols-4">
        {tabs.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-[3px] py-2 min-h-[56px] text-inkSoft text-[0.68rem] font-semibold no-underline"
          >
            <Icon className="w-[21px] h-[21px]" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
