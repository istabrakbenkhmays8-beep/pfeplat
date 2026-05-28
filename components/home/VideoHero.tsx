import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { getT } from "@/src/i18n/server";

/**
 * Full-bleed hero with an autoplay/muted/looping background video of people learning,
 * a dark gradient overlay for legibility, and a big centered search bar.
 *
 * The video is loaded from a stable Pexels CDN URL — if it fails the gradient still looks good.
 * Swap the URL by editing the <source> below if you want a different clip.
 */
export async function VideoHero() {
  const { t } = await getT();

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect width='16' height='9' fill='%23111'/%3E%3C/svg%3E"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source
          src="https://cdn.pixabay.com/video/2022/12/27/144064-784037595_large.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient + brand-tinted overlay */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(120deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.55) 45%, rgba(227,6,19,0.55) 100%)",
        }}
      />

      <div className="mx-auto flex min-h-[min(78vh,700px)] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
          {t.home.badge}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {t.home.heroTitle1}{" "}
          <span className="bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">
            {t.home.heroTitleAccent}
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-white/90 sm:text-lg">{t.home.heroSubtitle}</p>

        <div className="mt-8 w-full max-w-2xl">
          <SearchBar size="lg" placeholder={t.common.searchPlaceholder} />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-brand transition hover:bg-white/90"
          >
            {t.home.browseCourses}
          </Link>
          <Link
            href="/reference/planning-formation-juin-2026.pdf"
            target="_blank"
            className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="me-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t.home.downloadPlanning}
          </Link>
        </div>
      </div>
    </section>
  );
}
