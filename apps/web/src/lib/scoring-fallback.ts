/**
 * SustainX 2.0 TypeScript Fallback Ecological Scoring Engine
 * Mirrors the exact PRD Section 4 math from services/ai-dmrv/app/scoring.py
 * Ensures the entire platform and viva demo function seamlessly even when FastAPI is offline.
 */

export const LAMBDA_MOMENTUM = 0.85;

export const EMISSION_FACTORS: Record<string, number> = {
  TRANSPORTATION: 0.14,  // kg CO2 / passenger-km (Metro/Bus vs car)
  ELECTRICITY: 0.716,    // kg CO2 / kWh (CEA India National Grid Baseline)
  WASTE: 1.50,           // kg CO2 / kg segregated plastic + 1 EPR unit
  WATER: 0.00034,        // kg CO2 / Liter
  AFFORESTATION: 21.77,  // kg CO2 / sapling / year
};

export const DOMAIN_WEIGHTS: Record<string, number> = {
  ELECTRICITY: 0.30,
  WASTE: 0.25,
  TRANSIT: 0.20,
  WATER: 0.15,
  AFFORESTATION: 0.10,
};

export const REGIONAL_BASELINES: Record<string, { mean: number; sigma: number }> = {
  ELECTRICITY: { mean: 150.0, sigma: 45.0 },
  WASTE: { mean: 18.0, sigma: 5.0 },
  TRANSIT: { mean: 60.0, sigma: 20.0 },
  WATER: { mean: 4500.0, sigma: 1200.0 },
  AFFORESTATION: { mean: 2.0, sigma: 1.0 },
};

export const CONFIDENCE_MULTIPLIERS: Record<string, number> = {
  IOT_SIGNED: 1.00,
  BBPS_API: 1.00,
  QR_TICKET: 0.90,
  CV_PHOTO: 0.75,
  MANUAL: 0.20,
};

export function sigmoid(z: number): number {
  return 1.0 / (1.0 + Math.exp(-z));
}

export function computeAqiMultiplier(aqiLevel: number): number {
  if (aqiLevel >= 5) return 1.50;
  if (aqiLevel >= 4) return 1.25;
  return 1.00;
}

export function getTierFromScore(score: number): string {
  if (score >= 850) return "PLATINUM";
  if (score >= 600) return "GOLD";
  if (score >= 300) return "SILVER";
  return "BRONZE";
}

export interface ScoreParams {
  previousScore: number;
  domain: string;
  rawValue: number;
  verificationType: string;
  householdSize?: number;
  aqiLevel?: number;
  isFraud?: boolean;
  vestingDay?: number;
}

export interface ScoreResult {
  newCompositeScore: number;
  tier: string;
  co2SavedGrams: number;
  plasticSavedGrams: number;
  confidenceWeight: number;
  aqiMultiplier: number;
  zScore: number;
  sigmoidZ: number;
  domainContribution: number;
}

export function calculateScore(params: ScoreParams): ScoreResult {
  const domainKey = params.domain.toUpperCase();
  const w_k = DOMAIN_WEIGHTS[domainKey] || 0.20;
  const c_k = CONFIDENCE_MULTIPLIERS[params.verificationType?.toUpperCase()] || 0.20;
  const m_aqi = (domainKey === "TRANSIT" || domainKey === "AFFORESTATION")
    ? computeAqiMultiplier(params.aqiLevel || 3)
    : 1.00;
  const i_fraud = params.isFraud ? 0.0 : 1.0;

  const benchmark = REGIONAL_BASELINES[domainKey] || { mean: 100.0, sigma: 30.0 };
  const occupants = Math.max(1, params.householdSize || 3);
  const perCapita = params.rawValue / occupants;
  const z_k = (benchmark.mean - perCapita) / benchmark.sigma;
  const sig_z = sigmoid(z_k);

  let co2Grams = 0;
  let plasticGrams = 0;

  if (domainKey === "ELECTRICITY") {
    co2Grams = Math.round(params.rawValue * EMISSION_FACTORS.ELECTRICITY * 1000);
  } else if (domainKey === "WASTE") {
    co2Grams = Math.round(params.rawValue * EMISSION_FACTORS.WASTE * 1000);
    plasticGrams = Math.round(params.rawValue * 1000);
  } else if (domainKey === "TRANSIT") {
    co2Grams = Math.round(params.rawValue * EMISSION_FACTORS.TRANSPORTATION * 1000);
  } else if (domainKey === "WATER") {
    co2Grams = Math.round(params.rawValue * EMISSION_FACTORS.WATER * 1000);
  } else if (domainKey === "AFFORESTATION") {
    const vesting = (params.vestingDay || 1) <= 1 ? 0.20 : (params.vestingDay! <= 30 ? 0.60 : 1.00);
    co2Grams = Math.round(params.rawValue * EMISSION_FACTORS.AFFORESTATION * 1000 * vesting);
  }

  const stepReward = 1000.0 * (w_k * sig_z * c_k * m_aqi * i_fraud);
  const newScoreFloat = (LAMBDA_MOMENTUM * params.previousScore) + ((1.0 - LAMBDA_MOMENTUM) * (params.previousScore + stepReward));
  const newScore = Math.max(0, Math.min(1000, Math.round(newScoreFloat)));
  const tier = getTierFromScore(newScore);

  return {
    newCompositeScore: newScore,
    tier,
    co2SavedGrams: co2Grams,
    plasticSavedGrams: plasticGrams,
    confidenceWeight: c_k,
    aqiMultiplier: m_aqi,
    zScore: parseFloat(z_k.toFixed(4)),
    sigmoidZ: parseFloat(sig_z.toFixed(4)),
    domainContribution: parseFloat(stepReward.toFixed(2)),
  };
}
