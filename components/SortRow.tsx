import Link from "next/link";

export default function SortRow({
  q, cat, sort, rated,
}: { q?: string; cat?: string; sort?: string; rated?: number | null }) {
  const build = (next: { sort?: string; rated?: number | null }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (cat) p.set("cat", cat);
    const s = next.sort !== undefined ? next.sort : sort;
    const r = next.rated !== undefined ? next.rated : rated;
    if (s === "rating") p.set("sort", "rating");
    if (r) p.set("rated", String(r));
    const str = p.toString();
    return str ? "/?" + str : "/";
  };

  const pill = (label: string, href: string, on: boolean) => (
    <Link href={href} scroll={false}
      className={
        "text-[0.84rem] px-3 py-[6px] rounded-full border no-underline " +
        (on ? "bg-surface-2 border-inkSoft text-ink font-semibold"
            : "border-line text-inkSoft hover:text-ink")
      }>
      {label}
    </Link>
  );

  return (
    <div className="flex gap-2 items-center flex-wrap mt-3 text-[0.84rem]">
      <span className="text-inkSoft">Sort</span>
      {pill("Best match", build({ sort: "default" }), sort !== "rating")}
      {pill("Top rated", build({ sort: "rating" }), sort === "rating")}
      <span className="text-inkSoft ml-2">Show</span>
      {pill("Everyone", build({ rated: null }), !rated)}
      {pill("4 stars and up", build({ rated: 4 }), rated === 4)}
    </div>
  );
}
