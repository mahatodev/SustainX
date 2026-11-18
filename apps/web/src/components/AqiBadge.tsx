"use client";

import React, { useEffect, useState } from "react";
import { Wind, Flame, Radio } from "lucide-react";

export default function AqiBadge() {
  const [aqiData, setAqiData] = useState<{
    aqi: number;
    status: string;
    bountyMultiplier: number;
    city: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/env/aqi")
      .then((res) => res.json())
      .then((data) => {
        if (data.aqi) setAqiData(data);
      })
      .catch((err) => console.error("AQI Badge fetch error", err));
  }, []);

  if (!aqiData) {
    return (
      <div className="animate-pulse bg-emerald-950/40 border border-emerald-800/30 px-3.5 py-1.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
        <Wind className="w-3.5 h-3.5 animate-spin" />
        <span className="font-mono text-[11px]">Connecting Salt Lake 700091 Grid...</span>
      </div>
    );
  }

  const isBounty = aqiData.bountyMultiplier > 1.0;

  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/90 via-emerald-950/70 to-slate-900/90 text-white px-3.5 py-2 rounded-xl shadow-glass border border-emerald-500/20 backdrop-blur-md">
      <div className="flex items-center gap-2 text-xs">
        <div className="relative flex items-center justify-center">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1.5">
          <span className="text-[11px] text-slate-400 font-mono">Kolkata 700091:</span>
          <span className={`font-bold font-mono ${aqiData.aqi >= 4 ? "text-amber-400" : "text-emerald-400"}`}>
            AQI {aqiData.aqi} • {aqiData.status}
          </span>
        </div>
      </div>

      {isBounty && (
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-amber-500/40 shadow-sm animate-pulse-subtle">
          <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="font-mono">{aqiData.bountyMultiplier}x</span>
          <span className="text-[10px] hidden sm:inline uppercase tracking-wider text-amber-200">Transit Bounty</span>
        </div>
      )}
    </div>
  );
}
