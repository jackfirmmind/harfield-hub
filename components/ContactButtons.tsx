"use client";
import { waLink, telLink } from "@/lib/format";
import { track } from "./Track";
import { WaIcon, PhoneIcon } from "./Icons";
import { SITE_NAME } from "@/lib/config";

export default function ContactButtons({
  id, name, whatsapp, phone, full = false,
}: {
  id: string; name: string; whatsapp: string; phone?: string | null; full?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 text-[0.92rem] font-semibold min-h-[44px] px-4 rounded-btn no-underline";
  return (
    <div className={"flex gap-2 flex-wrap " + (full ? "w-full" : "")}>
      <a
        href={waLink(whatsapp, `Hi ${name}, I found you on ${SITE_NAME}.`)}
        target="_blank"
        rel="noopener"
        onClick={() => track(id, "whatsapp_tap")}
        className={base + " bg-primary text-onPrimary hover:bg-primaryHover " + (full ? "flex-1" : "")}
      >
        <WaIcon /> WhatsApp
      </a>
      {phone ? (
        <a
          href={telLink(phone)}
          onClick={() => track(id, "call_tap")}
          aria-label={`Call ${name}`}
          className={base + " bg-surface2 text-ink border border-line hover:border-inkSoft"}
        >
          <PhoneIcon /> Call
        </a>
      ) : null}
    </div>
  );
}
