"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { 
  Building2, 
  Coins, 
  FileCheck2, 
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  Hash
} from "lucide-react";

export default function CorporatePage() {
  const [pools, setPools] = useState<any>(null);
  const [retirements, setRetirements] = useState<any[]>([]);
  const [corporateName, setCorporateName] = useState("Techno India Group ESG Cell");
  const [brsrRef, setBrsrRef] = useState("SEBI-BRSR-2026-Q3-TIG");
  const [co2Amount, setCo2Amount] = useState(25.0);
  const [plasticAmount, setPlasticAmount] = useState(10.0);
  const [isRetiring, setIsRetiring] = useState(false);
  const [receipt, setReceipt] = useState<any>(null);

  const loadData = () => {
    fetch("/api/corporate")
      .then((res) => res.json())
      .then((data) => {
        if (data.pools) setPools(data.pools);
        if (data.retirements) setRetirements(data.retirements);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRetireBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRetiring(true);
    setReceipt(null);

    const amountInr = (co2Amount * 50) + (plasticAmount * 35);

    try {
      const res = await fetch("/api/corporate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          corporateName,
          brsrReference: brsrRef,
          co2Kg: co2Amount,
          plasticKg: plasticAmount,
          amountPaidInr: amountInr,
        }),
      });
      const data = await res.json();
      setReceipt(data);
      loadData();
      try {
        confetti({
          particleCount: 75,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#eab308", "#10b981", "#ffffff"],
        });
      } catch {
        // ignore
      }
    } catch (err: any) {
      alert("Retirement error: " + err.message);
    } finally {
      setIsRetiring(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-slate-100">
      {/* Header Bar */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight">
              Corporate ESG & EPR Portal
            </h1>
            <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs px-3 py-1 rounded-full font-bold">
              B2B / SEBI BRSR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-2xl leading-relaxed">
            Aggregate verified citizen micro-abatement into certified tonnes. Execute on-chain burns under the SustainImpact (ERC-1155) protocol and distribute 80% buyout proceeds to citizen reward pools.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-500/30 text-right">
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400">Smart Contract Standard</div>
          <div className="font-mono text-xs font-extrabold text-emerald-400 mt-0.5">SustainImpact (ERC-1155)</div>
        </div>
      </div>

      {/* Aggregate Credit Pools Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Available CO2e Pool</div>
          <div className="font-display text-3xl md:text-4xl font-black text-white">
            {pools?.totalCo2AvailableKg || "208.91"} <span className="text-sm font-mono text-emerald-400">kg</span>
          </div>
          <div className="text-[11px] font-mono text-emerald-400/90 font-medium">
            Token ID #1: Verified CO2 Grams
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Available EPR Plastic</div>
          <div className="font-display text-3xl md:text-4xl font-black text-white">
            {pools?.totalPlasticAvailableKg || "35.30"} <span className="text-sm font-mono text-cyan-400">kg</span>
          </div>
          <div className="text-[11px] font-mono text-cyan-400/90 font-medium">
            Token ID #2: Verified EPR Plastic
          </div>
        </div>

        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Active Cohort</div>
          <div className="font-display text-3xl md:text-4xl font-black text-white">
            {pools?.activeCitizensCount || 5} <span className="text-sm font-mono text-slate-400">Citizens</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400 font-medium">
            Techno Main Pilot Grid
          </div>
        </div>

        <div className="relative rounded-3xl p-6 bg-gradient-to-br from-amber-600 to-amber-700 text-white shadow-glow-lg border border-amber-400/40 space-y-3 overflow-hidden">
          <div className="text-xs font-mono font-bold text-amber-200 uppercase tracking-wider">Community Reward Pool</div>
          <div className="font-display text-3xl md:text-4xl font-black tracking-tight">
            ₹{pools?.rewardPoolFundedInr ? Math.round(pools.rewardPoolFundedInr) : "10460"}
          </div>
          <div className="text-[11px] font-mono text-amber-100 font-medium">
            80% Buyout Distributed to Citizens
          </div>
        </div>
      </div>

      {/* Buyout Form & Certificate Result */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-2.5 text-amber-300 font-display font-bold text-lg">
            <Coins className="w-5 h-5 text-amber-400" />
            <span>Execute On-Chain Batch Retirement</span>
          </div>

          <form onSubmit={handleRetireBatch} className="space-y-4 text-xs">
            <div>
              <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                Corporate / Campus Sponsor Entity
              </label>
              <input
                type="text"
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
                className="w-full glass-input rounded-xl p-3 font-medium text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                SEBI BRSR / EPR Reference Identifier
              </label>
              <input
                type="text"
                value={brsrRef}
                onChange={(e) => setBrsrRef(e.target.value)}
                className="w-full glass-input rounded-xl p-3 font-mono text-amber-300 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  CO2e to Retire (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="500"
                  value={co2Amount}
                  onChange={(e) => setCo2Amount(parseFloat(e.target.value))}
                  className="w-full glass-input rounded-xl p-3 font-mono text-emerald-300 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  EPR Plastic to Retire (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="200"
                  value={plasticAmount}
                  onChange={(e) => setPlasticAmount(parseFloat(e.target.value))}
                  className="w-full glass-input rounded-xl p-3 font-mono text-cyan-300 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-1.5">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-slate-400">Total Buyout Cost:</span>
                <span className="text-white font-extrabold font-display text-sm">
                  ₹{Math.round((co2Amount * 50) + (plasticAmount * 35))}
                </span>
              </div>
              <div className="text-[10px] font-mono text-emerald-400">
                80% (₹{Math.round(((co2Amount * 50) + (plasticAmount * 35)) * 0.8)}) immediately allocated to citizen cashback balances.
              </div>
            </div>

            <button
              type="submit"
              disabled={isRetiring}
              className="w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-display font-extrabold py-3.5 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.01]"
            >
              {isRetiring ? "Executing On-Chain Burn..." : "Retire Batch & Mint BRSR Certificate"}
            </button>
          </form>
        </div>

        {/* Certificate Display */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-center">
          {receipt ? (
            <div className="border border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 to-slate-950 p-6 rounded-3xl space-y-4 shadow-glow-emerald">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="font-display font-bold text-sm text-white">Official BRSR Ecological Certificate</div>
                    <div className="text-[10px] font-mono text-emerald-300">MoEFCC Green Credit / SEBI Standard</div>
                  </div>
                </div>
                <span className="bg-emerald-500 text-slate-950 font-mono text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  BURNED
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Retiring Corporate</span>
                  <span className="font-bold text-white text-sm">{corporateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">BRSR Report Ref</span>
                  <span className="font-mono text-amber-300">{brsrRef}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Certificate Hash</span>
                  <span className="font-mono text-[11px] text-emerald-300 break-all bg-black/40 p-2 rounded-xl border border-emerald-900/60 block mt-1">
                    {receipt.certificateHash}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Polygon Tx Hash</span>
                  <span className="font-mono text-[11px] text-cyan-300 break-all block mt-1">
                    {receipt.txHash}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/30 flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-mono font-bold">
                  +{receipt.compliance?.citizenCashbackFundedInr} INR Funded to Citizen Wallets
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500 py-16 text-xs space-y-2">
              <FileCheck2 className="w-10 h-10 text-amber-500/40 mx-auto" />
              <p>Execute an on-chain batch retirement to generate a verifiable cryptographic certificate hash.</p>
            </div>
          )}
        </div>
      </div>

      {/* Historical Ledger */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass border border-emerald-500/20 space-y-5">
        <h2 className="font-display text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-emerald-400" />
          <span>On-Chain Institutional Retirement Ledger</span>
        </h2>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-emerald-900/50 text-slate-400 font-mono font-bold uppercase text-[10px]">
                <th className="pb-3">Corporate Sponsor</th>
                <th className="pb-3">BRSR Ref</th>
                <th className="pb-3">CO2e Retired</th>
                <th className="pb-3">EPR Plastic</th>
                <th className="pb-3">Amount (INR)</th>
                <th className="pb-3">Certificate Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/60 font-medium">
              {retirements.map((r) => (
                <tr key={r.id} className="hover:bg-emerald-950/20 transition-colors">
                  <td className="py-3 font-bold text-white">{r.corporateName}</td>
                  <td className="py-3 font-mono text-slate-400">{r.brsrReference}</td>
                  <td className="py-3 font-mono text-emerald-400 font-bold">{r.co2RetiredKg} kg</td>
                  <td className="py-3 font-mono text-cyan-400 font-bold">{r.plasticRetiredKg} kg</td>
                  <td className="py-3 font-mono text-white">₹{r.amountPaidInr}</td>
                  <td className="py-3 font-mono text-[10px] text-slate-500 truncate max-w-[140px]">
                    {r.certificateHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
