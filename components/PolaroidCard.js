"use client";

import { tiltFor } from "@/lib/utils";

export default function PolaroidCard({ photo, onDelete, deleting }) {
  const tilt = tiltFor(photo.id);

  return (
    <div
      className="polaroid w-full max-w-[260px] mx-auto"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <div className="tape" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.url}
        alt={photo.note || "Uploaded photo"}
        className="w-full aspect-square object-cover bg-paper2"
        loading="lazy"
      />
      {photo.note ? (
        <p className="mt-3 font-display text-[15px] leading-snug text-ink/90 italic">
          {photo.note}
        </p>
      ) : null}
      {onDelete ? (
        <button
          onClick={() => onDelete(photo.id)}
          disabled={deleting}
          className="absolute bottom-2 right-2 font-mono text-[10px] uppercase tracking-wide
            text-rose-dark/70 hover:text-rose-dark disabled:opacity-40"
        >
          {deleting ? "Removing…" : "Remove"}
        </button>
      ) : null}
    </div>
  );
}
