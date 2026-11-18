"use client";

import React, { useEffect, useState } from "react";
import ScoreGauge from "@/components/ScoreGauge";
import AqiBadge from "@/components/AqiBadge";
import VerificationBadge from "@/components/VerificationBadge";
import confetti from "canvas-confetti";
import { 
  Coins, 
  ArrowUpRight, 
  Zap, 
  Recycle, 
  Train, 
  Droplets, 
  Trees, 
  CheckCircle2,
  Users,
  Sparkles,
  ChevronDown
} from "lucide-react";

export default function DashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actions, setActions] = useState<any[]>([]);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users?leaderboard=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setCurrentUser(data.users[0]);
        }
      })
      .catch((err) => console.error(err));

    fetch("/api/actions")
      .then((res) => res.json())
      .then((data) => {
        if (data.actions) setActions(data.actions);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRedeem = (serviceName: string, amount: number) => {
    if (!currentUser) return;
    if ((currentUser.rewardBalanceInr ?? 0) < amount) {
      alert("Insufficient reward cashback balance.");
      return;
    }

    // Trigger celebratory confetti interaction
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#10b981", "#34d399", "#f59e0b", "#007C04"],
      });
    } catch {
      // ignore
    }

    setCurrentUser((prev: any) => ({
      ...prev,
      rewardBalanceInr: (prev.rewardBalanceInr ?? 0) - amount,
    }));
    setRedeemSuccess(`Successfully redeemed ₹${amount} rebate on ${serviceName}! Direct voucher dispatched.`);
    setTimeout(() => setRedeemSuccess(null), 6000);
  };

  if (!currentUser) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <span className="font-mono text-xs text-emerald-400">Loading Citizen Ecological State...</span>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 text-slate-100">
      {/* Top Banner Bar */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight">
              Citizen Ecological Dashboard
            </h1>
            <span className="bg-gradient-to-r from-emerald-500/20 to-brand-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-xs px-3 py-1 rounded-full font-bold shadow-sm">
              {currentUser.tier} CITIZEN
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <span>Profile:</span>
            <strong className="text-white font-medium">{currentUser.name}</strong> 
            <span className="text-slate-500">(@{currentUser.nickname})</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-xs text-emerald-400">PIN: {currentUser.pinCode || "700091"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <AqiBadge />
          
          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <select
              className="appearance-none text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-emerald-500/30 rounded-xl pl-3.5 pr-8 py-2.5 font-medium cursor-pointer transition-colors focus:outline-none focus:border-emerald-400"
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) setCurrentUser(selected);
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-slate-200">
                  Switch: {u.name} ({u.tier})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {redeemSuccess && (
        <div className="glass-panel border-emerald-500/40 bg-emerald-950/60 text-emerald-200 px-5 py-4 rounded-2xl flex items-center gap-3 text-sm shadow-glow-emerald animate-pulse-subtle">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="font-medium">{redeemSuccess}</span>
        </div>
      )}

      {/* Main Grid: Gauge + Impact Counters + Reward Wallet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass flex flex-col items-center justify-between relative overflow-hidden">
          <div className="w-full flex justify-between items-center text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <span>Civic Soulbound Token</span>
            <span className="text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
              ID #{currentUser.sbtTokenId || "101"}
            </span>
          </div>

          <ScoreGauge score={currentUser.compositeScore} tier={currentUser.tier} />

          {/* Tier Progress Bar */}
          <div className="w-full space-y-2 mt-4">
            <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold">
              <span>Bronze</span>
              <span>Silver (300)</span>
              <span>Gold (600)</span>
              <span className="text-emerald-300">Platinum (850+)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-emerald-900/40">
              <div
                className="bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.min(100, (currentUser.compositeScore / 1000) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Impact Abatement Counters */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col justify-between">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Verified CO2e Abated
            </div>
            <div className="font-display text-4xl md:text-5xl font-black text-white mt-2">
              {(((currentUser.co2SavedGrams ?? 0)) / 1000).toFixed(2)}{" "}
              <span className="text-lg font-mono font-semibold text-emerald-400">kg CO2e</span>
            </div>
            <div className="text-xs text-emerald-400/90 mt-3 flex items-center gap-1.5 font-medium">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <span>Calculated via CEA Grid & DMRC Travel models</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col justify-between">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Segregated EPR Plastics
            </div>
            <div className="font-display text-4xl md:text-5xl font-black text-white mt-2">
              {(((currentUser.plasticSavedGrams ?? 0)) / 1000).toFixed(2)}{" "}
              <span className="text-lg font-mono font-semibold text-cyan-400">kg</span>
            </div>
            <div className="text-xs text-cyan-400/90 mt-3 flex items-center gap-1.5 font-medium">
              <Recycle className="w-4 h-4 text-cyan-400" />
              <span>Token ID #2: Verified EPR Plastic Grams</span>
            </div>
          </div>
        </div>

        {/* Citizen Reward Wallet */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-[#023430] via-[#00684A] to-[#007C04] text-white shadow-glow-lg flex flex-col justify-between border border-emerald-400/30 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Impact Reward Wallet
              </div>
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
                <Coins className="w-5 h-5 text-amber-300" />
              </div>
            </div>

            <div className="font-display text-5xl font-black tracking-tight mt-4">
              ₹{(currentUser.rewardBalanceInr ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
              Direct cashback funded by 80% corporate EPR buyouts and regional utility credits.
            </p>
          </div>

          <div className="space-y-3 mt-8">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-200">
              Redeem Cashback Voucher
            </div>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => handleRedeem("CESC Electricity Bill", 50)}
                className="w-full text-left bg-white/15 hover:bg-white/25 active:scale-[0.99] px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all backdrop-blur-md border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>⚡ CESC Bill ₹50 Rebate</span>
                </div>
                <span className="bg-emerald-950/60 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                  Claim
                </span>
              </button>

              <button
                onClick={() => handleRedeem("Kolkata Metro Smart Card", 30)}
                className="w-full text-left bg-white/15 hover:bg-white/25 active:scale-[0.99] px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-all backdrop-blur-md border border-white/10"
              >
                <div className="flex items-center gap-2">
                  <Train className="w-4 h-4 text-cyan-300" />
                  <span>🚇 Metro Smart Card ₹30 Top-Up</span>
                </div>
                <span className="bg-emerald-950/60 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                  Claim
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard and Recent Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Actions Feed */}
        <div className="lg:col-span-2 glass-panel p-6 md:p-8 rounded-3xl shadow-glass space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white tracking-tight">
              Recent Verified dMRV Actions
            </h2>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full font-bold">
              Zero-Spoof Registry
            </span>
          </div>

          <div className="space-y-3">
            {actions.slice(0, 5).map((action) => (
              <div 
                key={action.id} 
                className="p-4 rounded-2xl glass-panel-interactive flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center font-bold text-emerald-300">
                    {action.domain === "ELECTRICITY" && <Zap className="w-5 h-5 text-amber-400" />}
                    {action.domain === "WASTE" && <Recycle className="w-5 h-5 text-blue-400" />}
                    {action.domain === "TRANSIT" && <Train className="w-5 h-5 text-emerald-400" />}
                    {action.domain === "WATER" && <Droplets className="w-5 h-5 text-cyan-400" />}
                    {action.domain === "AFFORESTATION" && <Trees className="w-5 h-5 text-green-400" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {action.domain} Verification ({action.rawValue} {action.domain === "TRANSIT" ? "km" : (action.domain === "WASTE" ? "g" : "units")})
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Tx: <span className="text-emerald-400">{action.txHash?.substring(0, 16) || "0xverified"}...</span> • {new Date(action.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5">
                  <div className="font-display text-base font-extrabold text-emerald-400">
                    +{action.co2EquivalentG}g CO2e
                  </div>
                  <VerificationBadge status={action.status} confidence={action.confidenceWeight} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Civic Leaderboard */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Civic Leaderboard
            </h2>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Top Citizens</span>
          </div>

          <div className="space-y-3">
            {users.map((u, idx) => (
              <div 
                key={u.id} 
                className={`flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                  u.id === currentUser.id 
                    ? "bg-brand-700/20 border border-brand-500/30 shadow-sm" 
                    : "hover:bg-emerald-950/30 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-xs font-extrabold w-5 text-center ${
                    idx === 0 ? "text-amber-400" : (idx === 1 ? "text-slate-300" : (idx === 2 ? "text-amber-600" : "text-slate-500"))
                  }`}>
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.id === currentUser.id && (
                        <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 rounded">YOU</span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">{u.tier} Tier</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-display text-base font-black text-white">{u.compositeScore}</div>
                  <div className="text-[10px] font-mono text-slate-500">Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
