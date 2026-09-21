import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-12">
        <nav className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-950 text-lg font-bold text-white">
              T
            </div>
            <span className="text-lg font-semibold">Teleprompt</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white"
            >
              Create account
            </Link>
          </div>
        </nav>
        <section className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-neutral-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600">
              Private teleprompter
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-neutral-950 sm:text-5xl">
              Read scripts smoothly, privately, and comfortably on iPad.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-neutral-600">
              Create scripts, upload documents, personalize your reading
              experience, and launch a distraction-free prompter built for
              speaking and presentation.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/signup"
                className="rounded-full bg-neutral-950 px-6 py-3 text-base font-medium text-white"
              >
                Start free
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-neutral-300 bg-white px-6 py-3 text-base font-medium text-neutral-800"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-xl shadow-neutral-200/60">
            <div className="rounded-2xl bg-neutral-950 p-6 text-white">
              <div className="mb-6 flex items-center justify-between text-sm text-neutral-300">
                <span>Speaking mode</span>
                <span>142 WPM</span>
              </div>
              <div className="space-y-4 text-center text-2xl font-medium leading-relaxed">
                <p>“Keep your eyes on the audience, not the page.”</p>
                <p className="text-xl text-neutral-300">
                  Smooth scrolling with mirrored text and flexible reading
                  settings.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-neutral-400">
                <span>Play</span>
                <span>Speed</span>
                <span>Exit</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
