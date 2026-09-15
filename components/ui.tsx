export const inputCls =
  "w-full py-[13px] px-[14px] bg-surface border-[1.5px] border-line rounded-btn text-ink placeholder:text-inkSoft";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 font-semibold min-h-[48px] px-6 rounded-btn bg-primary text-onPrimary hover:bg-primaryHover no-underline disabled:opacity-60";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 font-semibold min-h-[48px] px-6 rounded-btn bg-surface text-ink border-[1.5px] border-line hover:border-inkSoft no-underline";

export function Field({
  label, hint, error, children,
}: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <label className="block font-semibold text-[0.95rem] mb-[6px]">
        {label}
        {hint && <span className="block font-normal text-inkSoft text-[0.85rem] mt-[2px]">{hint}</span>}
      </label>
      {children}
      {error && <p className="text-[0.85rem] font-semibold mt-[6px] m-0" style={{ color: "#B23A2E" }}>{error}</p>}
    </div>
  );
}

export function Option({
  checked, onChange, label, hint, type = "radio",
}: { checked: boolean; onChange: () => void; label: string; hint?: string; type?: "radio" | "checkbox" }) {
  return (
    <label
      className={
        "flex gap-3 items-start p-[13px] px-[14px] rounded-btn border-[1.5px] cursor-pointer " +
        (checked ? "border-primary bg-surface2" : "border-line bg-surface hover:border-inkSoft")
      }
    >
      <input
        type={type}
        checked={checked}
        onChange={onChange}
        className="mt-[3px] w-[18px] h-[18px] shrink-0 accent-[var(--primary)]"
      />
      <span className="text-[0.95rem]">
        <strong className="block font-semibold">{label}</strong>
        {hint && <small className="block text-inkSoft">{hint}</small>}
      </span>
    </label>
  );
}
