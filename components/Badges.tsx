export function VerifiedBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      title="Checked by The Harfield Hub"
      className={
        "inline-flex items-center gap-[5px] font-semibold text-primary " +
        (small ? "text-[0.74rem]" : "text-[0.82rem]")
      }
    >
      <svg viewBox="0 0 24 24" className={small ? "w-[13px] h-[13px]" : "w-4 h-4"} aria-hidden="true">
        <path
          fill="currentColor"
          d="m12 1.8 2.6 1.9 3.2-.2.9 3.1 2.6 1.9-1.3 3 1.3 3-2.6 1.9-.9 3.1-3.2-.2L12 22.2l-2.6-1.9-3.2.2-.9-3.1-2.6-1.9 1.3-3-1.3-3 2.6-1.9.9-3.1 3.2.2Z"
        />
        <path d="m8.2 12.2 2.6 2.6 5-5" stroke="var(--on-primary)" strokeWidth="2.2" fill="none"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Verified
    </span>
  );
}

export function Stars({ value, count, small = false }: { value: number | null; count?: number; small?: boolean }) {
  if (!value) return null;
  const size = small ? 13 : 15;
  return (
    <span className={"inline-flex items-center gap-1 " + (small ? "text-[0.76rem]" : "text-[0.84rem]")}>
      <span className="inline-flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <svg key={n} width={size} height={size} viewBox="0 0 24 24"
            style={{ color: n <= Math.round(value) ? "var(--accent)" : "var(--line)" }}>
            <path fill="currentColor" d="m12 2 3 6.6 7 .8-5.2 4.8 1.4 7L12 17.8 5.8 21.2l1.4-7L2 9.4l7-.8Z" />
          </svg>
        ))}
      </span>
      <span className="font-semibold">{value.toFixed(1)}</span>
      {typeof count === "number" && count > 0 && (
        <span className="text-inkSoft">({count})</span>
      )}
    </span>
  );
}
