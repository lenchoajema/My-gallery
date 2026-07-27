"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ManagePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const cleanSlug = slug
      .trim()
      .replace(/^https?:\/\/[^/]+\//, "")
      .replace(/^event\//, "")
      .replace(/\/$/, "");

    try {
      const res = await fetch(`/api/events/${cleanSlug}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not log in.");
        setSubmitting(false);
        return;
      }
      router.push(`/event/${cleanSlug}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 pt-14 pb-24">
      <Link href="/" className="font-mono text-xs text-ink-faint hover:text-brass">
        ← Back
      </Link>

      <p className="eyebrow mt-8 mb-3">Owner access</p>
      <h1 className="font-display text-4xl mb-2">Open your page</h1>
      <p className="text-ink-faint mb-10">
        Enter the page&rsquo;s address or just its short name, plus your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label" htmlFor="slug">Page name or link</label>
          <input
            id="slug"
            className="field"
            placeholder="amara-kofis-wedding"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error ? <p className="text-rose text-sm">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Checking…" : "Open page"}
        </button>
      </form>
    </main>
  );
}
