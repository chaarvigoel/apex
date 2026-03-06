"use client";

const MOCK = {
  cyclePhase: "Late Follicular Phase",
  trainingIntensity: "Moderate" as "High" | "Moderate" | "Recovery",
  biomechanicalAlert: true,
  tacticalAdjustment: "Neuromuscular Control Emphasis",
  recoveryProtocol:
    "Controlled eccentric loading; 48h between high-intensity sessions. Prioritize sleep and hydration.",
};

const intensityStyles = {
  High: "bg-apex-accent/20 text-apex-accent border-apex-accent/50",
  Moderate: "bg-apex-warning/20 text-apex-warning border-apex-warning/50",
  Recovery: "bg-apex-muted/20 text-gray-400 border-apex-border",
};

export default function Dashboard() {
  return (
    <section id="dashboard" className="border-b border-apex-border bg-apex-black py-16 px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-apex-muted">
          Daily Athlete Dashboard
        </h2>
        <p className="mb-10 text-2xl font-semibold text-white">
          Sync and adjust — your team plan meets your physiology.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="apex-card p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-muted">
              Current Cycle Phase
            </p>
            <p className="text-lg font-semibold text-white">{MOCK.cyclePhase}</p>
          </div>

          <div className="apex-card p-5">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-muted">
              Training Intensity Recommendation
            </p>
            <span
              className={`apex-badge mt-1 border ${intensityStyles[MOCK.trainingIntensity]}`}
            >
              {MOCK.trainingIntensity}
            </span>
          </div>

          <div className="apex-card p-5 sm:col-span-2 lg:col-span-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-muted">
              Biomechanical Safety
            </p>
            {MOCK.biomechanicalAlert ? (
              <div className="mt-2 flex items-center gap-2 rounded border border-apex-alert/50 bg-apex-alert/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-apex-alert" />
                <span className="text-sm font-medium text-apex-alert">
                  ACL Injury-Risk Alert
                </span>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-400">No elevated risk</p>
            )}
          </div>

          <div className="apex-card p-5 sm:col-span-2">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-muted">
              Tactical S&C Adjustment
            </p>
            <p className="text-base font-medium text-white">
              {MOCK.tacticalAdjustment}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Not generic rest — protocol-aligned load modulation.
            </p>
          </div>

          <div className="apex-card p-5 sm:col-span-2">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-apex-muted">
              Recovery Protocol
            </p>
            <p className="text-sm leading-relaxed text-gray-300">
              {MOCK.recoveryProtocol}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
