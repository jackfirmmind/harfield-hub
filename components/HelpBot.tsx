"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TREE } from "@/lib/botTree";
import type { BotCtx, BotOption } from "@/lib/botTypes";
import { OWNER_WA } from "@/lib/config";

type Line = { from: "bot" | "me"; text: string };

export default function HelpBot({ ctx }: { ctx: BotCtx }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nodeId, setNodeId] = useState("root");
  const [lines, setLines] = useState<Line[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const node = TREE[nodeId] || TREE.root;

  useEffect(() => {
    if (open && lines.length === 0) {
      setLines(TREE.root.say(ctx).map((t) => ({ from: "bot" as const, text: t })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lines, nodeId]);

  function waLink(topic: string) {
    const who = ctx.businessName
      ? `${ctx.businessName}${ctx.tier ? ` (${ctx.tier})` : ""}`
      : ctx.name || "a resident";
    return `https://wa.me/${OWNER_WA}?text=${encodeURIComponent(
      `Hi Jack, this is ${who} from The Harfield Hub. I need help with ${topic}.`
    )}`;
  }

  function choose(o: BotOption) {
    setLines((l) => [...l, { from: "me", text: o.label }]);

    if (o.href) {
      setOpen(false);
      router.push(o.href);
      return;
    }
    if (o.wa) {
      window.open(waLink(o.wa), "_blank", "noopener");
      setLines((l) => [...l, { from: "bot", text: "Opened WhatsApp for you. Jack usually replies within a few hours." }]);
      return;
    }
    if (o.to) {
      const next = TREE[o.to] || TREE.root;
      setHistory((h) => [...h, nodeId]);
      setNodeId(o.to);
      setLines((l) => [...l, ...next.say(ctx).map((t) => ({ from: "bot" as const, text: t }))]);
    }
  }

  function back() {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setNodeId(prev);
    setLines((l) => [...l, ...(TREE[prev] || TREE.root).say(ctx).map((t) => ({ from: "bot" as const, text: t }))]);
  }

  function restart() {
    setNodeId("root");
    setHistory([]);
    setLines(TREE.root.say(ctx).map((t) => ({ from: "bot" as const, text: t })));
  }

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open help"
          className="fixed right-4 bottom-[86px] md:bottom-6 z-[60] inline-flex items-center gap-2 min-h-[50px] px-5 rounded-full bg-primary text-onPrimary font-semibold shadow-lg"
          style={{ boxShadow: "0 8px 24px rgba(0,0,0,.22)" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a8 8 0 1 1-3.1-6.3" />
            <path d="M12 17v.01M12 14c0-2 2.2-2.1 2.2-3.9A2.2 2.2 0 0 0 10 9.4" />
          </svg>
          Help
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="Help"
          className="fixed z-[60] bg-surface border border-line flex flex-col
                     inset-x-0 bottom-0 top-0 md:inset-auto md:right-5 md:bottom-5
                     md:w-[400px] md:h-[620px] md:rounded-card md:border"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,.24)" }}
        >
          {/* header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-line bg-primary text-onPrimary md:rounded-t-card">
            <span className="w-9 h-9 rounded-full grid place-items-center shrink-0"
              style={{ background: "rgba(255,255,255,.16)" }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3 4 8v8l8 5 8-5V8Z" /><path d="M12 12v9M12 12 4 8M12 12l8-4" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[0.95rem] m-0 leading-tight">Hub helper</p>
              <p className="text-[0.75rem] m-0 opacity-80 leading-tight">
                {ctx.role === "business" ? "Business account"
                  : ctx.role === "admin" ? "Admin"
                  : ctx.role === "resident" ? "Resident account" : "Not logged in"}
              </p>
            </div>
            <button onClick={restart} aria-label="Start again" className="text-[0.78rem] underline opacity-90">Restart</button>
            <button onClick={() => setOpen(false)} aria-label="Close help"
              className="w-9 h-9 grid place-items-center rounded-full text-[1.3rem] leading-none">×</button>
          </div>

          {/* transcript */}
          <div className="flex-1 overflow-y-auto px-4 py-4 grid gap-2 content-start">
            {lines.map((l, i) => (
              <div key={i}
                className={
                  "max-w-[85%] px-[14px] py-[10px] rounded-card text-[0.92rem] leading-[1.5] " +
                  (l.from === "bot"
                    ? "bg-surface2 text-ink justify-self-start rounded-bl-[4px]"
                    : "bg-primary text-onPrimary justify-self-end rounded-br-[4px]")
                }
              >
                {l.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {/* options */}
          <div className="border-t border-line p-3 grid gap-2 max-h-[46%] overflow-y-auto">
            {node.options(ctx).map((o, i) => (
              <button
                key={i}
                onClick={() => choose(o)}
                className={
                  "text-left text-[0.9rem] font-semibold min-h-[44px] px-4 py-2 rounded-btn border-[1.5px] " +
                  (o.wa
                    ? "bg-accent border-accent text-accentInk"
                    : "bg-surface border-line text-ink hover:border-inkSoft")
                }
              >
                {o.label}
              </button>
            ))}
            {history.length > 0 && (
              <button onClick={back}
                className="text-left text-[0.85rem] text-inkSoft underline min-h-[36px] px-1">
                ← Back
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
