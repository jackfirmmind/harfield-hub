"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SearchIcon } from "./Icons";

export default function SearchBar({ initial = "" }: { initial?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(initial);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const t = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      startTransition(() => router.replace("/?" + next.toString(), { scroll: false }));
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="relative flex-1 min-w-0">
      <SearchIcon className="w-[19px] h-[19px] absolute left-4 top-1/2 -translate-y-1/2 text-inkSoft" />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Plumber, coffee, physio, dog walking…"
        aria-label="Search businesses"
        autoComplete="off"
        className="w-full text-[1.05rem] py-[15px] pl-[46px] pr-4 bg-surface border-[1.5px] border-line rounded-card text-ink placeholder:text-inkSoft"
      />
    </div>
  );
}
