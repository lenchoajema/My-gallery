"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EVENT_TYPES } from "@/lib/utils";

export default function CreatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    eventType: "wedding",
    eventDate: "",
    description: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Those two passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          eventType: form.eventType,
          eventDate: form.eventDate,
          description: form.description,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      // Remember this page's slug locally so /dashboard can list it without
      // needing any accounts.
      try {
        const mine = JSON.parse(localStorage.getItem("keepsake_pages") || "[]");
        localStorage.setItem(
          "keepsake_pages",
          JSON.stringify([...mine.filter((s) => s !== data.slug), data.slug])
        );
      } catch {
        // localStorage can fail in private browsing — not critical, skip.
      }

      router.push(`/event/${data.slug}`);
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto px-6 pt-14 pb-24">
      <Link href="/" className="font-mono text-xs text-ink-faint hover:text-brass">
        ← Back
      </Link>

      <p className="eyebrow mt-8 mb-3">New page</p>
      <h1 className="font-display text-4xl mb-2">Start your page</h1>
      <p className="text-ink-faint mb-10">
        This password is the only key to your page — write it down somewhere
        you&rsquo;ll find it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input
            id="title"
            className="field"
            placeholder="Amara & Kofi's Wedding"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="eventType">Type</label>
            <select
              id="eventType"
              className="field"
              value={form.eventType}
              onChange={(e) => update("eventType", e.target.value)}
            >
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="eventDate">Date</label>
            <input
              id="eventDate"
              type="date"
              className="field"
              value={form.eventDate}
              onChange={(e) => update("eventDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">A line about the day (optional)</label>
          <textarea
            id="description"
            className="field"
            rows={3}
            placeholder="What this day was, in a sentence or two."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="password">Owner password</label>
            <input
              id="password"
              type="password"
              className="field"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              minLength={4}
            />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              type="password"
              className="field"
              value={form.confirm}
              onChange={(e) => update("confirm", e.target.value)}
              required
              minLength={4}
            />
          </div>
        </div>

        {error ? <p className="text-rose text-sm">{error}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={submitting}>
          {submitting ? "Creating…" : "Create my page"}
        </button>
      </form>
    </main>
  );
}
