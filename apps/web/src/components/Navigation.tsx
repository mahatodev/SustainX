"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShieldCheck, 
  MessageSquare, 
  Building2, 
  Leaf, 
  Award,
  Sparkles,
  ChevronRight
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", badge: "Live", icon: LayoutDashboard },
  { href: "/verify", label: "dMRV Verify Hub", badge: "Anti-Spoof", icon: ShieldCheck },
  { href: "/feed", label: "Verified Flutters", badge: null, icon: MessageSquare },
  { href: "/corporate", label: "Corporate ESG", badge: "B2B", icon: Building2 },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-72 bg-[#02201d]/90 backdrop-blur-2xl text-white flex-shrink-0 flex md:flex-col justify-between p-4 md:p-6 border-b md:border-b-0 md:border-r border-emerald-900/40 z-30 sticky top-0 md:h-screen">
      <div className="w-full">
        {/* Brand Header */}
        <Link href="/" className="group flex items-center gap-3 mb-8 px-2 py-1.5 transition-transform hover:scale-[1.02]">
          <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-glow-emerald">
            <Leaf className="w-6 h-6 transition-transform group-hover:rotate-12 duration-300" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#02201d] animate-ping" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#02201d]" />
          </div>
          <div>
            <div className="font-display font-black text-xl leading-tight tracking-tight flex items-center gap-1.5">
              <span>SustainX</span>
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase bg-gradient-to-r from-emerald-400 to-brand-400 text-slate-950 px-1.5 py-0.5 rounded-md shadow-sm">
                2.0
              </span>
            </div>
            <div className="text-[10px] font-mono tracking-wider text-emerald-400/80 font-semibold uppercase">
              Micro-dMRV Protocol
            </div>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-brand-700 to-brand-800 text-white shadow-glow-emerald border border-emerald-400/30"
                    : "text-slate-300 hover:text-white hover:bg-emerald-950/40 border border-transparent hover:border-emerald-800/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive ? "bg-white/20 text-white" : "bg-emerald-950/60 text-emerald-400 group-hover:bg-brand-700/30 group-hover:text-emerald-300"
                  }`}>
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  <span className="font-medium tracking-tight">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/25 text-white" : "bg-emerald-950/80 text-emerald-400 border border-emerald-800/40"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-200 hidden md:inline" />}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Institutional Capstone Badge */}
      <div className="hidden md:block pt-6 border-t border-emerald-900/40 space-y-3">
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/80 to-[#02201d] border border-emerald-800/30 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              PROJ-IT781
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              MAKAUT
            </span>
          </div>
          <div className="font-bold text-slate-200 text-xs leading-snug">
            Techno Main Salt Lake
          </div>
          <div className="text-[11px] text-slate-400">
            Supervisor: Mr. Soumitra Sasmal
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-emerald-400/60 px-1 font-mono">
          <span>Polygon Amoy Testnet</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
