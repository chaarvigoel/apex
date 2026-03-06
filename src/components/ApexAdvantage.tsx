const FEATURES = [
  {
    title: "Transparency",
    tagline: "No black box.",
    body: "Our models are trained on aggregated female performance metrics, not general step counts. You see the logic behind recommendations—no proprietary opacity.",
  },
  {
    title: "Safety Necessity",
    tagline: "Built for female physiology.",
    body: "Specifically designed to address the increased likelihood of ACL tears in female athletes. Cycle-aware load modulation is a safety layer, not an add-on.",
  },
  {
    title: "Tactical Integration",
    tagline: "Sync and adjust.",
    body: "We don't replace your coach's sport-specific plan. Apex is the service layer that optimizes the training you're already doing—team load meets individual physiology.",
  },
];

export default function ApexAdvantage() {
  return (
    <section className="border-b border-apex-border bg-apex-slate py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-apex-accent">
          The Apex Advantage
        </h2>
        <p className="mb-12 text-2xl font-semibold text-white">
          Why we’re different from Wild.AI, Ultrahuman, and generic wellness trackers.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="apex-card border-apex-border p-6 transition hover:border-apex-accent/30"
            >
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-accent">
                {f.tagline}
              </p>
              <h3 className="mb-3 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
