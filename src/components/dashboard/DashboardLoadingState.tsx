export function DashboardLoadingState() {
  return (
    <div className="page-shell">
      <div className="page-grid mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="glass-panel mx-auto w-full max-w-4xl p-8 text-center sm:p-10">
          <span className="glass-chip text-xs uppercase tracking-[0.28em] text-sky-700">
            Weather Dashboard
          </span>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Loading Tapah&apos;s weather lens...
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Pulling the shared dashboard response now so the glassmorphism layout can hydrate with
            live weather, air quality, and hiking guidance.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
            <div className="glass-panel min-h-[18rem] animate-pulse bg-white/35 p-6" />
            <div className="glass-panel min-h-[18rem] animate-pulse bg-white/35 p-6" />
          </div>
        </section>
      </div>
    </div>
  )
}
