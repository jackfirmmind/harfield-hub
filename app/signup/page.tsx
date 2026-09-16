import Link from "next/link";

export const metadata = { title: "Sign up — The Harfield Hub" };

export default function SignupChoice() {
  return (
    <div className="mx-auto max-w-[680px] px-5 py-14">
      <h1 className="h-display text-[2rem] mb-2">Create an account</h1>
      <p className="text-inkSoft mb-8 text-[0.98rem]">
        Which one are you?
      </p>

      <div className="grid gap-4">
        <Link
          href="/signup/resident"
          className="bg-surface border border-line rounded-card p-6 no-underline hover:border-inkSoft block"
        >
          <div className="flex items-start gap-4">
            <span className="shrink-0 w-11 h-11 rounded-full bg-surface2 grid place-items-center text-primary">
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M3 21V10l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" />
              </svg>
            </span>
            <div>
              <h2 className="h-display text-[1.25rem] m-0 mb-1">I live here</h2>
              <p className="text-[0.93rem] text-inkSoft m-0">
                Save the businesses you want to come back to, and leave reviews
                for the ones you have used.
              </p>
              <p className="text-[0.88rem] font-semibold text-primary mt-3 m-0">
                Sign up as a resident →
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/join/apply"
          className="bg-primary text-onPrimary rounded-card p-6 no-underline block"
        >
          <div className="flex items-start gap-4">
            <span className="shrink-0 w-11 h-11 rounded-full grid place-items-center"
              style={{ background: "rgba(255,255,255,.16)" }}>
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M3 21h18M5 21V8l7-4 7 4v13M9 21v-6h6v6" />
              </svg>
            </span>
            <div>
              <h2 className="h-display text-[1.25rem] m-0 mb-1">I run a business</h2>
              <p className="text-[0.93rem] m-0 opacity-90">
                Get found by your neighbours. Your first 90 days are free on the
                Free plan.
              </p>
              <p className="text-[0.88rem] font-semibold mt-3 m-0" style={{ color: "var(--accent)" }}>
                List your business →
              </p>
            </div>
          </div>
        </Link>
      </div>

      <p className="text-[0.92rem] text-inkSoft mt-8">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
