"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls, btnPrimary } from "@/components/ui";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (password.length < 8) { setErr("Password must be at least 8 characters."); return; }
    setBusy(true); setErr("");
    const { error } = await createClient().auth.signUp({
      email, password,
      options: { data: { full_name: name, role: "resident" } },
    });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[420px] px-5 py-14">
      <h1 className="h-display text-[2rem] mb-2">Create an account</h1>
      <p className="text-inkSoft mb-6 text-[0.95rem]">
        So you can save the businesses you want to come back to.
      </p>
      <Field label="Your name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Email">
        <input className={inputCls} type="email" value={email} autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" hint="At least 8 characters" error={err}>
        <input className={inputCls} type="password" value={password} autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <button className={btnPrimary + " w-full"} onClick={submit} disabled={busy}>
        {busy ? "Creating…" : "Create account"}
      </button>
      <p className="text-[0.9rem] text-inkSoft mt-6">
        Already have one? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
