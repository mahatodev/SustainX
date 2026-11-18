import Link from "next/link";
import { 
  ShieldCheck, 
  Leaf, 
  Cpu, 
  ArrowRight, 
  Coins, 
  Zap,
  Recycle,
  Train,
  Droplets,
  Trees,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import AqiBadge from "@/components/AqiBadge";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen text-slate-100">
      {/* Top Header Glass Bar */}
      <header className="sticky top-0 z-40 bg-[#030d0c]/80 backdrop-blur-xl border-b border-emerald-900/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-glow-emerald">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-display font-black text-xl tracking-tight text-white flex items-center gap-2">
              <span>SustainX</span>
              <span className="text-xs font-mono font-bold bg-brand-700 text-emerald-200 px-1.5 py-0.5 rounded">2.0</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400/80 hidden sm:inline">
              PROJ-IT781 • Techno Main Salt Lake
            </span>
          </div>
        </div>
        <AqiBadge />
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 shadow-glass mb-8 animate-float-slow">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Dual-Token Micro-dMRV Protocol on Polygon</span>
            <span className="bg-brand-600/40 px-2 py-0.5 rounded-full text-[10px] text-emerald-200">
              ERC-5192 + ERC-1155
            </span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] mb-8 max-w-5xl mx-auto">
            Your Everyday Ecological Actions. <br />
            <span className="text-gradient-emerald">Audited & Minted On-Chain.</span>
          </h1>

          {/* Clean Subtext */}
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-12 leading-relaxed font-normal">
            Eliminating self-reported greenwashing through cryptographic dMRV: Bharat Connect utility integration, 
            HMAC-signed ESP32 smart bins, and zero-replay transit tickets aggregated into institutional carbon buyouts.
          </p>

          {/* CTA Button Group */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-500 via-brand-600 to-brand-700 hover:from-emerald-400 hover:to-brand-600 text-slate-950 px-8 py-4 rounded-2xl font-display font-extrabold text-base shadow-glow-emerald transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <span>Launch Citizen Dashboard</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/verify"
              className="inline-flex items-center justify-center gap-2.5 glass-panel-interactive px-7 py-4 rounded-2xl font-display font-bold text-base text-emerald-300 hover:text-white"
            >
              <Cpu className="w-5 h-5 text-emerald-400" />
              <span>Open dMRV Viva Demo Studio</span>
            </Link>

            <Link
              href="/corporate"
              className="inline-flex items-center justify-center gap-2.5 glass-panel-interactive px-7 py-4 rounded-2xl font-display font-bold text-base text-amber-300 hover:text-white"
            >
              <Coins className="w-5 h-5 text-amber-400" />
              <span>Corporate ESG Portal</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Impact Ticker Glass Strip */}
      <section className="relative z-20 max-w-6xl mx-auto px-6 -mt-12 mb-20 w-full">
        <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-glass-dark border border-emerald-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-900/40">
            <div className="p-3">
              <div className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">
                208.9 <span className="text-lg font-mono text-emerald-400">kg</span>
              </div>
              <div className="text-xs uppercase font-mono font-bold text-emerald-400 mt-2 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified CO2e Abated
              </div>
            </div>

            <div className="p-3 pt-6 md:pt-3">
              <div className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">
                35.3 <span className="text-lg font-mono text-cyan-400">kg</span>
              </div>
              <div className="text-xs uppercase font-mono font-bold text-cyan-400 mt-2 flex items-center justify-center gap-1.5">
                <Recycle className="w-3.5 h-3.5" />
                EPR Plastic Recovered
              </div>
            </div>

            <div className="p-3 pt-6 md:pt-3">
              <div className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">
                5 <span className="text-lg font-mono text-amber-400">Households</span>
              </div>
              <div className="text-xs uppercase font-mono font-bold text-amber-400 mt-2 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Techno Pilot Cohort
              </div>
            </div>

            <div className="p-3 pt-6 md:pt-3">
              <div className="font-display text-4xl md:text-5xl font-black text-gradient-gold tracking-tight">
                100%
              </div>
              <div className="text-xs uppercase font-mono font-bold text-yellow-300 mt-2 flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Anti-Spoof Enforced
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 Domains Grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center mb-14">
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Section 4 PRD Specification
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Five-Domain Ecological Accounting Engine
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto">
            Per-capita Z-score normalized & temporal momentum weighted according to national benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-4 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Electricity</h3>
              <div className="font-mono text-xs text-amber-400 font-bold mt-0.5">30% Weight</div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                0.716 kg CO2/kWh CEA India Grid baseline reconciled via Bharat Connect (BBPS).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/30 text-[11px] font-mono text-slate-400">
              Confidence: 1.00
            </div>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mb-4 shadow-sm">
                <Recycle className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Waste</h3>
              <div className="font-mono text-xs text-blue-400 font-bold mt-0.5">25% Weight</div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                1.50 kg CO2/kg + 1 EPR credit via HMAC-SHA256 signed ESP32 bin load-cell nodes.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/30 text-[11px] font-mono text-slate-400">
              Confidence: 1.00
            </div>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-sm">
                <Train className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Green Transit</h3>
              <div className="font-mono text-xs text-emerald-400 font-bold mt-0.5">20% Weight</div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                0.14 kg CO2/km saved via SHA-256 zero-replay Metro QR ticketing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/30 text-[11px] font-mono text-slate-400">
              Confidence: 0.90
            </div>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4 shadow-sm">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Water</h3>
              <div className="font-mono text-xs text-cyan-400 font-bold mt-0.5">15% Weight</div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                0.34 kg CO2/1000L saved via municipal meter baseline reconciliation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/30 text-[11px] font-mono text-slate-400">
              Confidence: 1.00
            </div>
          </div>

          <div className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-green-500/15 border border-green-500/30 text-green-400 flex items-center justify-center mb-4 shadow-sm">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-white text-base">Afforestation</h3>
              <div className="font-mono text-xs text-green-400 font-bold mt-0.5">10% Weight</div>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                21.77 kg CO2/tree with 3-stage survival vesting (Day 1, 30, 90).
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-emerald-900/30 text-[11px] font-mono text-slate-400">
              Confidence: 0.75
            </div>
          </div>
        </div>
      </section>

      {/* Capstone Footer */}
      <footer className="mt-auto bg-[#021513] text-slate-400 py-12 px-6 border-t border-emerald-900/40 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-display font-bold text-white text-sm">
              Techno Main Salt Lake — Dept. of Information Technology
            </div>
            <div className="text-slate-400">
              PROJ-IT781 Capstone Project 2026 • Supervisor: Mr. Soumitra Sasmal
            </div>
          </div>
          <div className="text-center md:text-right space-y-1">
            <div className="text-emerald-400 font-mono font-semibold">Engineering Team:</div>
            <div className="text-slate-300">
              Deepak Kumar • Devpriya Mahato • Jashika Chourasia • Kirtan Kumar • Md Imran
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
