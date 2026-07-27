import Link from "next/link";

const SAMPLE_NOTES = [
  "The first dance, before anyone noticed we'd both forgotten the steps.",
  "Six candles, one very determined toddler.",
  "Nobody agreed to this pose. Everyone did it anyway.",
];

export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto px-6 pt-16 pb-24">
      <header className="flex items-center justify-between mb-20">
        <span className="font-display text-lg tracking-tight">Keepsake Pages</span>
        <nav className="flex items-center gap-3">
          <Link href="/manage" className="text-sm text-ink-faint hover:text-brass">
            I already have a page
          </Link>
          <Link href="/create" className="btn-primary">
            Start a page
          </Link>
        </nav>
      </header>

      <section className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="eyebrow mb-4">A page for the pictures and what they meant</p>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mb-6">
            Keep the pictures.
            <br />
            Keep the story.
          </h1>
          <p className="text-ink-faint text-lg leading-relaxed mb-8 max-w-md">
            Make a page for a wedding, a birthday, or any day worth remembering.
            Add photos with a note under each one, then decide who gets to see
            it: just you, or anyone with the link.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/create" className="btn-primary">
              Start a page — it&rsquo;s free
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Your pages on this device
            </Link>
          </div>
        </div>

        <div className="relative h-[380px] hidden md:block">
          {SAMPLE_NOTES.map((note, i) => (
            <div
              key={note}
              className="polaroid absolute w-56"
              style={{
                top: `${i * 28}px`,
                left: `${i * 46}px`,
                zIndex: i,
                transform: `rotate(${(i - 1) * 6}deg)`,
              }}
            >
              <div className="tape" />
              <div className="w-full aspect-square bg-paper2 flex items-center justify-center">
                <span className="font-mono text-[10px] text-ink-faint uppercase tracking-widest">
                  Photo {i + 1}
                </span>
              </div>
              <p className="mt-3 font-display text-sm italic leading-snug text-ink/80">
                {note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-28 grid sm:grid-cols-3 gap-10 border-t border-ink-light pt-12">
        <div>
          <p className="eyebrow mb-3">01 — Make</p>
          <p className="text-ink-faint leading-relaxed">
            Give your page a title and a date. You&rsquo;ll set a password
            that&rsquo;s yours alone — that&rsquo;s what makes you the owner.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">02 — Fill it in</p>
          <p className="text-ink-faint leading-relaxed">
            Upload photos one at a time, with a short note under each so the
            pictures keep their story attached.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">03 — Share, or don&rsquo;t</p>
          <p className="text-ink-faint leading-relaxed">
            Flip the page to public when you&rsquo;re ready and send the link.
            Keep it private for as long as you like — nobody sees a private
            page but you.
          </p>
        </div>
      </section>
    </main>
  );
}
