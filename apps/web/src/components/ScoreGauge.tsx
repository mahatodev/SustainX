"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number;
  tier: string;
}

export default function ScoreGauge({ score, tier }: ScoreGaugeProps) {
  const normalized = Math.max(0, Math.min(1000, score));
  const radius = 72;
  const circumference = 2 * Math.PI * radius; // ~452.38
  const strokeDashoffset = circumference - (circumference * (normalized / 1000));

  const getTierDetails = (t: string) => {
    switch (t.toUpperCase()) {
      case "PLATINUM":
        return {
          stroke: "#E5E4E2",
          gradient: "from-slate-200 via-indigo-100 to-white",
          glow: "rgba(229, 228, 226, 0.4)",
          text: "text-slate-100",
          badgeBg: "bg-slate-200/15 border-slate-200/30 text-slate-100",
        };
      case "GOLD":
        return {
          stroke: "#FFD700",
          gradient: "from-amber-300 via-yellow-400 to-amber-500",
          glow: "rgba(255, 215, 0, 0.4)",
          text: "text-amber-300",
          badgeBg: "bg-amber-400/15 border-amber-400/30 text-amber-300",
        };
      case "SILVER":
        return {
          stroke: "#C0C0C0",
          gradient: "from-slate-300 via-gray-300 to-slate-400",
          glow: "rgba(192, 192, 192, 0.35)",
          text: "text-slate-200",
          badgeBg: "bg-slate-400/15 border-slate-400/30 text-slate-200",
        };
      default:
        return {
          stroke: "#CD7F32",
          gradient: "from-amber-600 via-orange-600 to-amber-700",
          glow: "rgba(205, 127, 50, 0.35)",
          text: "text-amber-500",
          badgeBg: "bg-amber-600/15 border-amber-600/30 text-amber-400",
        };
    }
  };

  const details = getTierDetails(tier);

  return (
    <div className="flex flex-col items-center justify-center p-2 relative group">
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Outer radial glow effect */}
        <div 
          className="absolute inset-4 rounded-full blur-2xl opacity-40 transition-opacity duration-700 group-hover:opacity-75"
          style={{ backgroundColor: details.glow }}
        />

        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 180 180">
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor={details.stroke} />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={details.stroke} floodOpacity="0.6"/>
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#0a2a26"
            strokeWidth="14"
            fill="transparent"
          />

          {/* Dynamic Progress Arc */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth="14"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute flex flex-col items-center justify-center text-center z-20">
          <span className="font-display text-5xl font-black text-white tracking-tight drop-shadow-md">
            {normalized}
          </span>
          <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-emerald-400/80 mt-0.5">
            Score / 1000
          </span>
          <span 
            className={`text-[11px] font-mono font-extrabold uppercase px-3 py-0.5 mt-2 rounded-full border backdrop-blur-md ${details.badgeBg}`}
          >
            {tier} TIER
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-mono text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span>ERC-5192 Soulbound Reputation</span>
      </div>
    </div>
  );
}
