"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls, btnPrimary } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setErr("");
    const { error } = await createClient().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-[420px] px-5 py-14">
      <h1 className="h-display text-[2rem] mb-6">Log in</h1>
      <Field label="Email">
        <input className={inputCls} type="email" value={email} autoComplete="email"
          onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" error={err}>
        <input className={inputCls} type="password" value={password} autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()} />
      </Field>
      <button className={btnPrimary + " w-full"} onClick={submit} disabled={busy}>
        {busy ? "Logging in…" : "Log in"}
      </button>
      <p className="text-[0.9rem] text-inkSoft mt-6">
        No account yet? <Link href="/signup">Sign up</Link> or{" "}
        <Link href="/join/apply">list your business</Link>.
      </p>
    </div>
  );
}

export default function Login() {
  return <Suspense><LoginForm /></Suspense>;
}
