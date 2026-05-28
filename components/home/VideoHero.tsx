import Link from "next/link";
import { SearchBar } from "@/components/ui/SearchBar";
import { getT } from "@/src/i18n/server";

/**
 * Hero with looping background video of learners + a centred search bar.
 * The video files are hot-linked from Pixabay's CDN (public-domain, no key needed).
 * If the network is slow, the dark gradient + photo poster stays visible.
 */

const VIDEO_PRIMARY = "https://cdn.pixabay.com/video/2024/02/27/202054-918918082_large.mp4"; // students at computers
const VIDEO_FALLBACK = "https://cdn.pixabay.com/video/2022/12/27/144064-784037595_large.mp4"; // group studying
const POSTER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&q=70&auto=format&fit=crop"; // students smiling at laptop

export async function VideoHero() {
  const { t } = await getT();

  return (
    <section className="relative isolate overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={POSTER}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
        aria-hidden="true"
      >
        <source src={VIDEO_PRIMARY} type="video/mp4" />
        <source src={VIDEO_FALLBACK} type="video/mp4" />
      </video>

      {/* Subtle neutral overlay — just enough for white text to stay legible without tinting the video. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />

      <div className="mx-auto flex min-h-[min(78vh,700px)] max-w-5xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
        <p className="text-base font-semibold tracking-wide text-white/95 sm:text-lg">
          {t.home.heroPretitle}
        </p>

        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          BOOST YOUR CAREER
          <br />
          GET CERTIFIED
        </h1>

        <p className="mt-5 max-w-2xl text-sm text-white/85 sm:text-base">{t.home.heroSubtitle}</p>

        <div className="mt-8 w-full max-w-3xl rounded-2xl bg-white/95 p-3 shadow-xl backdrop-blur dark:bg-card/95">
          <SearchBar size="lg" placeholder={t.common.searchPlaceholder} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {/* PDF download stays as a plain <a> with target=_blank — it's a static asset, not a Next page. */}
          <a
            href="/reference/planning-formation-juin-2026.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-brand transition hover:bg-white/90"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" className="me-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t.home.downloadPlanning}
          </a>
          <Link
            href="/catalog"
            className="inline-flex h-12 items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            {t.home.browseCourses}
          </Link>
        </div>
      </div>
    </section>
  );
}
