import Hero from "@/components/Hero";
import Dashboard from "@/components/Dashboard";
import ApexAdvantage from "@/components/ApexAdvantage";
import ChartPlaceholders from "@/components/ChartPlaceholders";

export default function Home() {
  return (
    <main>
      <header className="border-b border-apex-border bg-apex-slate/80 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span className="text-lg font-bold tracking-tight text-white">
            APEX
          </span>
          <nav className="flex gap-6 text-sm text-gray-400">
            <a href="#dashboard" className="hover:text-white">
              Dashboard
            </a>
            <a href="#advantage" className="hover:text-white">
              Advantage
            </a>
            <a href="#data" className="hover:text-white">
              Data
            </a>
          </nav>
        </div>
      </header>

      <Hero />
      <Dashboard />
      <section id="advantage">
        <ApexAdvantage />
      </section>
      <section id="data">
        <ChartPlaceholders />
      </section>

      <footer className="border-t border-apex-border bg-apex-slate py-8 px-6">
        <div className="mx-auto max-w-6xl text-center text-xs text-apex-muted">
          Apex — Performance engine for elite female athletes. Sync and adjust.
        </div>
      </footer>
    </main>
  );
}
