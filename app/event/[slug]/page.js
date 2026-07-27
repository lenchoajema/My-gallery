"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import PolaroidCard from "@/components/PolaroidCard";
import { EVENT_TYPES } from "@/lib/utils";

export default function EventPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [state, setState] = useState({ loading: true });
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}`);
      const data = await res.json();
      if (!res.ok) {
        setState({ loading: false, error: data.error, private: data.private });
        return;
      }
      setState({ loading: false, event: data.event, photos: data.photos, isOwner: data.isOwner });
    } catch {
      setState({ loading: false, error: "Could not reach the server." });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");
    if (!file) {
      setUploadError("Choose a photo first.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("note", note);

    try {
      const res = await fetch(`/api/events/${slug}/photos`, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
        setUploading(false);
        return;
      }
      setState((s) => ({ ...s, photos: [data.photo, ...s.photos] }));
      setNote("");
      setFile(null);
      e.target.reset();
    } catch {
      setUploadError("Could not reach the server.");
    }
    setUploading(false);
  }

  async function handleDeletePhoto(photoId) {
    setDeletingId(photoId);
    try {
      const res = await fetch(`/api/events/${slug}/photos/${photoId}`, { method: "DELETE" });
      if (res.ok) {
        setState((s) => ({ ...s, photos: s.photos.filter((p) => p.id !== photoId) }));
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleVisibility() {
    setSavingVisibility(true);
    const nextValue = !state.event.is_public;
    try {
      const res = await fetch(`/api/events/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setState((s) => ({ ...s, event: data.event }));
      }
    } finally {
      setSavingVisibility(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleDeletePage() {
    const res = await fetch(`/api/events/${slug}`, { method: "DELETE" });
    if (res.ok) {
      try {
        const mine = JSON.parse(localStorage.getItem("keepsake_pages") || "[]");
        localStorage.setItem("keepsake_pages", JSON.stringify(mine.filter((s) => s !== slug)));
      } catch {}
      router.push("/");
    }
  }

  if (state.loading) {
    return (
      <main className="max-w-3xl mx-auto px-6 pt-24 text-center">
        <p className="font-mono text-sm text-ink-faint">Loading…</p>
      </main>
    );
  }

  if (state.private) {
    return (
      <main className="max-w-md mx-auto px-6 pt-24 text-center">
        <p className="eyebrow mb-4">Private</p>
        <h1 className="font-display text-3xl mb-4">This page isn&rsquo;t public</h1>
        <p className="text-ink-faint mb-8">
          Its owner hasn&rsquo;t shared it yet. If it&rsquo;s yours, log in below.
        </p>
        <Link href="/manage" className="btn-primary">Log in as owner</Link>
      </main>
    );
  }

  if (state.error) {
    return (
      <main className="max-w-md mx-auto px-6 pt-24 text-center">
        <p className="eyebrow mb-4">Not found</p>
        <h1 className="font-display text-3xl mb-4">{state.error}</h1>
        <Link href="/" className="btn-primary">Back home</Link>
      </main>
    );
  }

  const { event, photos, isOwner } = state;
  const typeLabel = EVENT_TYPES.find((t) => t.value === event.event_type)?.label || "Event";

  return (
    <main className="max-w-5xl mx-auto px-6 pt-12 pb-24">
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="font-mono text-xs text-ink-faint hover:text-brass">
          ← Keepsake Pages
        </Link>
        {isOwner ? (
          <span className="font-mono text-[10px] uppercase tracking-widest text-brass border border-brass/40 rounded-full px-3 py-1">
            You&rsquo;re the owner
          </span>
        ) : null}
      </div>

      <header className="mb-12">
        <p className="eyebrow mb-3">
          {typeLabel}
          {event.event_date ? ` — ${new Date(event.event_date + "T00:00:00").toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}` : ""}
        </p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">{event.title}</h1>
        {event.description ? (
          <p className="text-ink-faint text-lg max-w-2xl leading-relaxed">{event.description}</p>
        ) : null}
      </header>

      {isOwner ? (
        <section className="mb-14 border border-ink-light rounded-xl p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="label !mb-1">Visibility</p>
              <p className="text-sm text-ink-faint">
                {event.is_public
                  ? "Anyone with the link can view this page."
                  : "Only you can see this page right now."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={copyLink} className="btn-secondary !px-4 !py-2 text-sm">
                {copied ? "Link copied" : "Copy share link"}
              </button>
              <button
                onClick={toggleVisibility}
                disabled={savingVisibility}
                className={event.is_public ? "btn-secondary !px-4 !py-2 text-sm" : "btn-primary !px-4 !py-2 text-sm"}
              >
                {savingVisibility ? "Saving…" : event.is_public ? "Make private" : "Publish page"}
              </button>
            </div>
          </div>

          <form onSubmit={handleUpload} className="border-t border-ink-light pt-6 space-y-4">
            <p className="label !mb-1">Add a photo</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="field file:mr-4 file:btn-secondary file:!py-1.5 file:!px-3 file:text-xs file:cursor-pointer"
            />
            <textarea
              className="field"
              rows={2}
              placeholder="A note to go with this photo (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {uploadError ? <p className="text-rose text-sm">{uploadError}</p> : null}
            <button type="submit" className="btn-primary" disabled={uploading}>
              {uploading ? "Uploading…" : "Add photo"}
            </button>
          </form>

          <div className="border-t border-ink-light pt-6">
            {confirmingDelete ? (
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm text-rose">Delete this whole page and every photo on it? This can&rsquo;t be undone.</p>
                <button onClick={handleDeletePage} className="btn-danger !px-4 !py-1.5 text-sm">
                  Yes, delete it
                </button>
                <button onClick={() => setConfirmingDelete(false)} className="text-sm text-ink-faint hover:text-paper">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={() => setConfirmingDelete(true)} className="font-mono text-xs text-ink-faint hover:text-rose">
                Delete this page
              </button>
            )}
          </div>
        </section>
      ) : null}

      {photos.length === 0 ? (
        <div className="border border-dashed border-ink-light rounded-lg p-14 text-center">
          <p className="text-ink-faint">
            {isOwner ? "No photos yet — add the first one above." : "No photos here yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-14">
          {photos.map((photo) => (
            <PolaroidCard
              key={photo.id}
              photo={photo}
              onDelete={isOwner ? handleDeletePhoto : undefined}
              deleting={deletingId === photo.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}
