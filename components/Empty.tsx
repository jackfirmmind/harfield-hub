export default function Empty({
  title, children,
}: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border-[1.5px] border-dashed border-line rounded-card px-6 py-8 text-center text-inkSoft">
      <strong className="block text-ink h-display text-[1.15rem] mb-[6px] font-bold">
        {title}
      </strong>
      {children}
    </div>
  );
}
