"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const [pages, setPages] = useState(null);

  useEffect(() => {
    let mine = [];
    try {
      mine = JSON.parse(localStorage.getItem("keepsake_pages") || "[]");
    } catch {
      mine = [];
    }

    if (mine.length === 0) {
      setPages([]);
      return;
    }

    Promise.all(
      mine.map(async (slug) => {
        try {
          const res = await fetch(`/api/events/${slug}`);
          const data = await res.json();
          if (res.ok) {
            return { slug, title: data.event.title, isPublic: data.event.is_public, ok: true };
          }
          return { slug, ok: false };
        } catch {
          return { slug, ok: false };
        }
      })
    ).then(setPages);
  }, []);

  function forget(slug) {
    const mine = JSON.parse(localStorage.getItem("keepsake_pages") || "[]");
    const next = mine.filter((s) => s !== slug);
    localStorage.setItem("keepsake_pages", JSON.stringify(next));
    setPages((p) => p.filter((pg) => pg.slug !== slug));
  }

  return (
    <main className="max-w-2xl mx-auto px-6 pt-14 pb-24">
      <Link href="/" className="font-mono text-xs text-ink-faint hover:text-brass">
        ← Back
      </Link>

      <p className="eyebrow mt-8 mb-3">This device</p>
      <h1 className="font-display text-4xl mb-2">Your pages</h1>
      <p className="text-ink-faint mb-10">
        This is just a shortcut list saved in this browser — it&rsquo;s not
        where your data lives. Bookmark or share the actual page links
        themselves.
      </p>

      {pages === null ? (
        <p className="text-ink-faint font-mono text-sm">Loading…</p>
      ) : pages.length === 0 ? (
        <div className="border border-dashed border-ink-light rounded-lg p-10 text-center">
          <p className="text-ink-faint mb-6">No pages created on this device yet.</p>
          <Link href="/create" className="btn-primary">Start a page</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {pages.map((p) => (
            <li
              key={p.slug}
              className="flex items-center justify-between gap-4 border border-ink-light rounded-lg px-5 py-4"
            >
              <div>
                <p className="font-display text-lg">{p.ok ? p.title : p.slug}</p>
                <p className="font-mono text-xs text-ink-faint">
                  {p.ok ? (p.isPublic ? "Public" : "Private") : "Sign in to open"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={p.ok ? `/event/${p.slug}` : `/manage`}
                  className="btn-secondary !px-4 !py-1.5 text-xs"
                >
                  Open
                </Link>
                <button
                  onClick={() => forget(p.slug)}
                  className="font-mono text-xs text-ink-faint hover:text-rose"
                >
                  Forget
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
