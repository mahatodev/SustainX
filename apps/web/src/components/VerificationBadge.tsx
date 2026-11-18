"use client";

import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface VerificationBadgeProps {
  status: string;
  confidence?: number;
  type?: string;
}

export default function VerificationBadge({ status, confidence = 1.0, type }: VerificationBadgeProps) {
  if (status === "VERIFIED") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>dMRV Verified {type ? `(${type})` : ""}</span>
        <span className="text-[10px] text-emerald-600 font-mono">({Math.round(confidence * 100)}%)</span>
      </span>
    );
  }

  if (status === "REJECTED_SPOOF") {
    return (
      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        <span>Anti-Spoof Rejected</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-medium">
      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
      <span>Flagged Anomaly</span>
    </span>
  );
}
