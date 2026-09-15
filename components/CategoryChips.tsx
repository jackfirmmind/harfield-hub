import Link from "next/link";

export default function CategoryChips({
  categories, active, q, sort, rated,
}: {
  categories: { category: string; count: number }[];
  active?: string;
  q?: string;
  sort?: string;
  rated?: number | null;
}) {
  const build = (cat?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat) p.set("cat", cat);
    if (sort === "rating") p.set("sort", "rating");
    if (rated) p.set("rated", String(rated));
    const s = p.toString();
    return s ? "/?" + s : "/";
  };

  const chip = (label: string, href: string, on: boolean) => (
    <Link
      key={label}
      href={href}
      scroll={false}
      className={
        "shrink-0 whitespace-nowrap text-[0.88rem] px-[14px] py-2 rounded-full border-[1.5px] no-underline " +
        (on
          ? "bg-primary border-primary text-onPrimary"
          : "border-line text-inkSoft hover:text-ink hover:border-inkSoft")
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="chipwrap mt-4">
      <div className="flex gap-2 pb-[2px] md:flex-wrap">
        {chip("All", build(), !active)}
        {categories.map((c) => chip(c.category, build(c.category), active === c.category))}
      </div>
    </div>
  );
}
