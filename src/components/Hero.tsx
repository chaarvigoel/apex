export default function Hero() {
  return (
    <section className="relative border-b border-apex-border bg-apex-slate py-24 px-6 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-apex-accent">
          NCAA Division I & II — High-Impact Sports
        </p>
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          The Performance Engine for Elite Female Athletes.
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-400">
          Move beyond &quot;black box&quot; wellness scores. Apex integrates
          cycle-specific physiological data with neuromuscular training load
          adjustments to mitigate ACL injury risk and maximize power output.
        </p>
        <a
          href="#dashboard"
          className="inline-flex items-center gap-2 rounded-sm border border-apex-accent bg-apex-accent px-6 py-3 text-sm font-semibold uppercase tracking-wider text-apex-black transition hover:bg-emerald-400"
        >
          Integrate Your Program
        </a>
      </div>
    </section>
  );
}
