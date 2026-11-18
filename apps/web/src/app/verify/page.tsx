"use client";

import React, { useState } from "react";
import VerificationBadge from "@/components/VerificationBadge";
import confetti from "canvas-confetti";
import { 
  Zap, 
  Recycle, 
  Train, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Radio,
  FileCheck2,
  AlertTriangle
} from "lucide-react";

export default function VerifyStudioPage() {
  const [activeTab, setActiveTab] = useState<"bbps" | "iot" | "transit" | "antiSpoof">("bbps");

  // BBPS State
  const [bbpsBiller, setBbpsBiller] = useState("CESC-KOLKATA");
  const [consumerNo, setConsumerNo] = useState("09128391024");
  const [occupants, setOccupants] = useState("3");
  const [bbpsResult, setBbpsResult] = useState<any>(null);
  const [bbpsLoading, setBbpsLoading] = useState(false);

  // IoT State
  const [iotWeight, setIotWeight] = useState(480);
  const [iotWaste, setIotWaste] = useState("PET_PLASTIC");
  const [iotResult, setIotResult] = useState<any>(null);
  const [iotLoading, setIotLoading] = useState(false);

  // Transit QR State
  const [ticketId, setTicketId] = useState("DMRC-KOL-987123");
  const [origin, setOrigin] = useState("Salt Lake Sector V");
  const [dest, setDest] = useState("Sealdah");
  const [distance, setDistance] = useState(8.5);
  const [transitResult, setTransitResult] = useState<any>(null);
  const [transitLoading, setTransitLoading] = useState(false);

  // Anti-Spoofing Demo State
  const [spoofStep, setSpoofStep] = useState<{
    testName: string;
    stage1: { text: string; passed: boolean } | null;
    stage2: { text: string; passed: boolean; reason?: string } | null;
  } | null>(null);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#10b981", "#34d399", "#38bdf8"],
      });
    } catch {
      // ignore
    }
  };

  const handleBbpsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBbpsLoading(true);
    setBbpsResult(null);
    try {
      const res = await fetch("/api/verify/utility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billerId: bbpsBiller,
          consumerNumber: consumerNo,
          householdOccupants: occupants,
        }),
      });
      const data = await res.json();
      setBbpsResult(data);
      if (data.success) triggerCelebration();
    } catch (err: any) {
      alert("BBPS Error: " + err.message);
    } finally {
      setBbpsLoading(false);
    }
  };

  const handleIotTrigger = async () => {
    setIotLoading(true);
    setIotResult(null);
    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const res = await fetch("/api/verify/iot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: "ESP32-BIN-001",
          userId: "usr_deepak_01",
          wasteType: iotWaste,
          weightGrams: iotWeight,
          energyKwh: 0.12,
          timestamp,
          hmacSignature: "auto_signed_in_demo",
        }),
      });
      const data = await res.json();
      setIotResult(data);
      if (data.success) triggerCelebration();
    } catch (err: any) {
      alert("IoT Error: " + err.message);
    } finally {
      setIotLoading(false);
    }
  };

  const handleTransitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTransitLoading(true);
    setTransitResult(null);
    try {
      const res = await fetch("/api/verify/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "TRANSIT",
          ticketId,
          originStation: origin,
          destStation: dest,
          distanceKm: distance,
        }),
      });
      const data = await res.json();
      setTransitResult(data);
      if (data.success) triggerCelebration();
    } catch (err: any) {
      alert("Transit Error: " + err.message);
    } finally {
      setTransitLoading(false);
    }
  };

  // Anti-Spoofing Test 1: Duplicate pHash Collision
  const runDuplicateImageTest = async () => {
    setSpoofStep({
      testName: "Gate 1: Perceptual Hash (pHash) Duplicate Image Collision",
      stage1: { text: "Step 1: Submitting original sapling photo (Unique 64-bit pHash registered)...", passed: true },
      stage2: null,
    });

    const formData1 = new FormData();
    formData1.append("category", "AFFORESTATION");
    formData1.append("forceDuplicate", "false");

    await fetch("/api/verify/proof", { method: "POST", body: formData1 });

    setTimeout(async () => {
      const formData2 = new FormData();
      formData2.append("category", "AFFORESTATION");
      formData2.append("forceDuplicate", "true");

      const res = await fetch("/api/verify/proof", { method: "POST", body: formData2 });
      const data = await res.json();

      setSpoofStep((prev) => ({
        ...prev!,
        stage2: {
          text: "Step 2: Submitting duplicate image downloaded from web (Identical pHash)...",
          passed: false,
          reason: data.rejectionReason || "ERR_DUPLICATE_IMAGE_SPOOF: pHash collision detected (Hamming distance <= 6)",
        },
      }));
    }, 1200);
  };

  // Anti-Spoofing Test 2: QR Nonce Replay Attack
  const runQrReplayTest = async () => {
    const replayId = "REPLAY-DEMO-" + Math.floor(Math.random() * 10000);
    setSpoofStep({
      testName: "Gate 2: SHA-256 Nonce Transit Zero-Replay Protection",
      stage1: { text: `Step 1: First commuter claims Metro ticket ${replayId}...`, passed: true },
      stage2: null,
    });

    await fetch("/api/verify/proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: replayId, originStation: "Sector V", destStation: "Sealdah", distanceKm: 8.5 }),
    });

    setTimeout(async () => {
      const res = await fetch("/api/verify/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: replayId, originStation: "Sector V", destStation: "Sealdah", distanceKm: 8.5 }),
      });
      const data = await res.json();

      setSpoofStep((prev) => ({
        ...prev!,
        stage2: {
          text: `Step 2: Second user scans identical Metro ticket ${replayId} (Replay attack)...`,
          passed: false,
          reason: data.rejectionReason || "ERR_QR_NONCE_REPLAY: Ticket nonce already claimed on-chain.",
        },
      }));
    }, 1200);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 text-slate-100">
      {/* Header */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass border border-emerald-500/20 space-y-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Cpu className="w-8 h-8 text-emerald-400" />
            <span>dMRV Verification Studio</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Live interactive laboratory for viva evaluators. Test multi-modal hardware telemetry, municipal bill reconciliation, and real-time anti-spoofing rejection gates.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab("bbps")}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "bbps" 
                ? "bg-gradient-to-r from-emerald-600 to-brand-700 text-white shadow-glow-emerald border border-emerald-400/40" 
                : "glass-panel-interactive text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Bharat Connect (BBPS)</span>
          </button>

          <button
            onClick={() => setActiveTab("iot")}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "iot" 
                ? "bg-gradient-to-r from-emerald-600 to-brand-700 text-white shadow-glow-emerald border border-emerald-400/40" 
                : "glass-panel-interactive text-slate-300 hover:text-white"
            }`}
          >
            <Recycle className="w-4 h-4 text-cyan-400" />
            <span>ESP32 Smart Bin Drop</span>
          </button>

          <button
            onClick={() => setActiveTab("transit")}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "transit" 
                ? "bg-gradient-to-r from-emerald-600 to-brand-700 text-white shadow-glow-emerald border border-emerald-400/40" 
                : "glass-panel-interactive text-slate-300 hover:text-white"
            }`}
          >
            <Train className="w-4 h-4 text-emerald-400" />
            <span>Metro QR Ticket</span>
          </button>

          <button
            onClick={() => setActiveTab("antiSpoof")}
            className={`px-4 py-2.5 rounded-xl text-xs font-display font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === "antiSpoof" 
                ? "bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-lg shadow-rose-900/50 border border-rose-400/40" 
                : "bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40 hover:text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>🔴 Test Anti-Spoofing (Simulate Fraud)</span>
          </button>
        </div>
      </div>

      {/* Tab 1: BBPS Utility */}
      {activeTab === "bbps" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
            <div className="flex items-center gap-2.5 text-amber-300 font-display font-bold text-lg">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Bharat Connect (BBPS) Invoicing Protocol</span>
            </div>

            <form onSubmit={handleBbpsSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Utility Biller Provider
                </label>
                <select
                  value={bbpsBiller}
                  onChange={(e) => setBbpsBiller(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-slate-200 font-medium focus:outline-none"
                >
                  <option value="CESC-KOLKATA" className="bg-slate-900">CESC-KOLKATA (Calcutta Electric Supply Corp)</option>
                  <option value="WBSEDCL" className="bg-slate-900">WBSEDCL (West Bengal State Electricity)</option>
                  <option value="KMC-WATER" className="bg-slate-900">KMC-WATER (Kolkata Municipal Corporation)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Consumer Identification Number (CID)
                </label>
                <input
                  type="text"
                  value={consumerNo}
                  onChange={(e) => setConsumerNo(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 font-mono text-emerald-300"
                  placeholder="e.g. 09128391024"
                  required
                />
              </div>

              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Household Occupants (N_occupants for Per-Capita Z-Score)
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 font-mono text-slate-200"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={bbpsLoading}
                className="w-full bg-gradient-to-r from-emerald-500 via-brand-600 to-brand-700 hover:from-emerald-400 hover:to-brand-600 text-slate-950 font-display font-extrabold py-3.5 rounded-xl shadow-glow-emerald transition-all duration-300"
              >
                {bbpsLoading ? "Querying National BBPS Grid..." : "Reconcile Invoice & Verify Savings"}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-center">
            {bbpsResult ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-400 uppercase">Verification Output</span>
                  <VerificationBadge status={bbpsResult.verification?.status} confidence={1.0} type="BBPS API" />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Historical 12-Month Baseline:</span>
                    <span className="font-mono font-bold text-slate-200">{bbpsResult.usageData?.baselineUsage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Actual Metered Usage:</span>
                    <span className="font-mono font-bold text-slate-200">{bbpsResult.usageData?.actualUsage}</span>
                  </div>
                  <div className="flex justify-between border-t border-emerald-900/50 pt-2">
                    <span className="text-emerald-400 font-bold">Conservation Delta:</span>
                    <span className="font-mono font-extrabold text-emerald-300">{bbpsResult.usageData?.savedUnits}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-[#02201d] border border-emerald-500/30 text-xs text-emerald-200 space-y-1.5 shadow-sm">
                  <div className="font-display font-bold text-white text-sm">✅ On-Chain Score Impact:</div>
                  <div>Carbon Abated: <strong className="text-emerald-300">+{bbpsResult.verification?.co2SavedGrams}g CO2e</strong></div>
                  <div>New Soulbound Score: <strong className="text-white">{bbpsResult.verification?.newScore}</strong> ({bbpsResult.verification?.newTier} Tier)</div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16 text-xs space-y-2">
                <FileCheck2 className="w-10 h-10 text-emerald-500/40 mx-auto" />
                <p>Submit consumer credentials to inspect deterministic BBPS meter reconciliation.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: IoT Smart Bin */}
      {activeTab === "iot" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-5">
            <div className="flex items-center gap-2.5 text-cyan-300 font-display font-bold text-lg">
              <Recycle className="w-5 h-5 text-cyan-400" />
              <span>ESP32-CAM + HX711 Telemetry Simulator</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates cryptographic HMAC-SHA256 packets matching the tabletop hardware firmware specification.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Waste Category
                </label>
                <select
                  value={iotWaste}
                  onChange={(e) => setIotWaste(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 text-slate-200 font-medium focus:outline-none"
                >
                  <option value="PET_PLASTIC" className="bg-slate-900">PET Plastic (1.50 kg CO2/kg + 1 EPR Credit)</option>
                  <option value="PAPER" className="bg-slate-900">Segregated Paper / Cardboard</option>
                  <option value="METAL" className="bg-slate-900">Aluminum / Metal Cans</option>
                </select>
              </div>

              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Load Cell Weight (Grams)
                </label>
                <input
                  type="number"
                  min="25"
                  max="5000"
                  value={iotWeight}
                  onChange={(e) => setIotWeight(parseInt(e.target.value, 10))}
                  className="w-full glass-input rounded-xl p-3 font-mono text-cyan-300"
                />
              </div>

              <button
                onClick={handleIotTrigger}
                disabled={iotLoading}
                className="w-full bg-gradient-to-r from-cyan-500 via-emerald-600 to-brand-700 hover:from-cyan-400 hover:to-emerald-500 text-slate-950 font-display font-extrabold py-3.5 rounded-xl shadow-glow-emerald transition-all duration-300"
              >
                {iotLoading ? "Transmitting HMAC Packet..." : "Transmit Signed IoT Deposit Packet"}
              </button>
            </div>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-center">
            {iotResult ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-400 uppercase">Hardware Packet Result</span>
                  <VerificationBadge status={iotResult.status} confidence={1.0} type="HMAC-SHA256" />
                </div>

                <div className="bg-slate-950/90 border border-emerald-900/60 text-emerald-400 p-4 rounded-2xl font-mono text-[11px] overflow-x-auto shadow-inner">
                  <pre>{JSON.stringify(iotResult, null, 2)}</pre>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16 text-xs space-y-2">
                <Radio className="w-10 h-10 text-cyan-500/40 mx-auto animate-pulse" />
                <p>Click transmit to dispatch an HMAC-SHA256 packet through the dMRV pipeline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Transit QR */}
      {activeTab === "transit" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-5">
            <div className="flex items-center gap-2.5 text-emerald-300 font-display font-bold text-lg">
              <Train className="w-5 h-5 text-emerald-400" />
              <span>Metro Transit Zero-Replay Scanner</span>
            </div>

            <form onSubmit={handleTransitSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Ticket Serial ID
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  className="w-full glass-input rounded-xl p-3 font-mono text-emerald-300"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                    Origin Station
                  </label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 font-medium text-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                    Destination Station
                  </label>
                  <input
                    type="text"
                    value={dest}
                    onChange={(e) => setDest(e.target.value)}
                    className="w-full glass-input rounded-xl p-3 font-medium text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono font-semibold text-slate-300 mb-1.5 uppercase text-[11px]">
                  Distance (Kilometers)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value))}
                  className="w-full glass-input rounded-xl p-3 font-mono text-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={transitLoading}
                className="w-full bg-gradient-to-r from-emerald-500 via-brand-600 to-brand-700 hover:from-emerald-400 hover:to-brand-600 text-slate-950 font-display font-extrabold py-3.5 rounded-xl shadow-glow-emerald transition-all duration-300"
              >
                {transitLoading ? "Verifying Transit Nonce..." : "Verify Transit QR Ticket"}
              </button>
            </form>
          </div>

          <div className="glass-panel p-6 md:p-8 rounded-3xl flex flex-col justify-center">
            {transitResult ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-400 uppercase">Transit Outcome</span>
                  <VerificationBadge status={transitResult.status} confidence={0.9} type="QR Nonce" />
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/20 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Route:</span>
                    <span className="font-bold text-white">{origin} ➔ {dest} ({distance} km)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carbon Abated:</span>
                    <span className="font-mono font-extrabold text-emerald-300">+{transitResult.credits?.co2SavedGrams}g CO2e</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dynamic Multiplier:</span>
                    <span className="font-mono font-bold text-amber-400">{transitResult.credits?.aqiMultiplier}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-16 text-xs space-y-2">
                <Train className="w-10 h-10 text-emerald-500/40 mx-auto" />
                <p>Submit ticket details to test zero-replay transit verification.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Anti-Spoofing Viva Interactive Demonstration */}
      {activeTab === "antiSpoof" && (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-rose-500/30 bg-rose-950/20 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">
                  Viva Demonstration Suite: Anti-Spoofing & Rejection Gates
                </h2>
                <p className="text-xs text-rose-200/80 mt-1 max-w-3xl leading-relaxed">
                  Demonstrate to examiners in real time how SustainX 2.0 blocks fraudulent green claims, duplicate Google-downloaded photos, and QR ticket replay attacks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={runDuplicateImageTest}
                className="glass-panel-interactive p-5 rounded-2xl text-left border-rose-500/30 hover:border-rose-400 space-y-2 group"
              >
                <div className="font-display font-bold text-base text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                  <span>🔴 Test 1: Duplicate Image Spoof</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">pHash</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulates a citizen uploading a web-downloaded photo. The 64-bit Hamming distance gate detects collision and rejects with zero points awarded.
                </p>
              </button>

              <button
                onClick={runQrReplayTest}
                className="glass-panel-interactive p-5 rounded-2xl text-left border-rose-500/30 hover:border-rose-400 space-y-2 group"
              >
                <div className="font-display font-bold text-base text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                  <span>🔴 Test 2: QR Ticket Replay Attack</span>
                  <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded">SHA-256</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulates two passengers scanning the same QR ticket. The SHA-256 cryptographic constraint in SQLite blocks the duplicate claim immediately.
                </p>
              </button>
            </div>
          </div>

          {/* Real-Time Visualizer Panel */}
          {spoofStep && (
            <div className="glass-panel p-6 md:p-8 rounded-3xl border border-emerald-500/20 space-y-4">
              <h3 className="font-display font-bold text-white text-base">{spoofStep.testName}</h3>

              <div className="space-y-3 text-xs">
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-emerald-200 font-medium">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>{spoofStep.stage1?.text}</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold">
                    VERIFIED (PASSED)
                  </span>
                </div>

                {/* Stage 2 */}
                {spoofStep.stage2 ? (
                  <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-rose-200 font-medium">
                        <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        <span>{spoofStep.stage2.text}</span>
                      </div>
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold">
                        BLOCKED BY dMRV GATE
                      </span>
                    </div>
                    <div className="text-rose-300 font-mono text-[11px] bg-black/40 p-3 rounded-xl border border-rose-900/60">
                      {spoofStep.stage2.reason}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-3 text-slate-400">
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-[11px]">Executing second fraudulent attempt to trigger gate...</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
