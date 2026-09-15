"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { btnGhost } from "./ui";

export default function QrCard({ slug, name }: { slug: string; name: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const link = `${window.location.origin}/b/${slug}`;
    setUrl(link);
    if (ref.current) {
      QRCode.toCanvas(ref.current, link, { width: 320, margin: 2,
        color: { dark: "#14564F", light: "#FFFFFF" } });
    }
  }, [slug]);

  function download() {
    const canvas = ref.current; if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${slug}-qr.png`;
    a.click();
  }

  return (
    <div className="bg-surface border border-line rounded-card p-5">
      <h2 className="h-display text-[1.15rem] m-0 mb-1">Your QR code</h2>
      <p className="text-[0.9rem] text-inkSoft mb-4">
        Print it and stick it on your window or counter. People scan it and land
        straight on your page.
      </p>
      <canvas ref={ref} className="rounded-btn border border-line bg-white max-w-[200px] w-full h-auto" />
      <div className="flex gap-3 flex-wrap mt-4">
        <button className={btnGhost} onClick={download}>Download PNG</button>
      </div>
      {url && <p className="text-[0.8rem] text-inkSoft mt-3 m-0 break-all">{url}</p>}
    </div>
  );
}
