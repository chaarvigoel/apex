export default function ChartPlaceholders() {
  return (
    <section className="border-b border-apex-border bg-apex-black py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-apex-muted">
          Data Correlation Views
        </h2>
        <p className="mb-10 text-xl font-semibold text-white">
          HRV, RHR & injury risk patterns over the 28-day cycle
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="chart-placeholder h-64">
            <span>HRV × Cycle Phase — Chart placeholder</span>
          </div>
          <div className="chart-placeholder h-64">
            <span>RHR × Cycle Phase — Chart placeholder</span>
          </div>
          <div className="chart-placeholder h-64 md:col-span-2">
            <span>Injury risk pattern over 28-day cycle — Chart placeholder</span>
          </div>
        </div>
      </div>
    </section>
  );
}
