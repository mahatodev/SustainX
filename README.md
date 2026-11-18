# SustainX 2.0: A Verified Personal Ecological Credit & Micro-dMRV Protocol

[![Next.js 15](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

> **B.Tech in Information Technology — Final Year Capstone Project (`PROJ-IT781`)**  
> **Institution:** Techno Main Salt Lake, Kolkata (Affiliated to MAKAUT)  
> **Project Supervisor:** Mr. Soumitra Sasmal  
> **Core Engineering Team:**  
> - Deepak Kumar (`13000223053`)  
> - Devpriya Mahato (`13000223055`)  
> - Jashika Chourasia (`13000223065`)  
> - Kirtan Kumar (`13000223069`)  
> - Md Imran (`13000223076`)  

---

## 1. Executive Summary & Product Architecture

**SustainX 2.0** transforms everyday household ecological actions into mathematically auditable, non-transferable civic credit scores and fractional on-chain micro-carbon credits. The system integrates five sustainability domains: **Electricity Conservation (30%)**, **Waste Segregation (25%)**, **Green Transit (20%)**, **Water Conservation (15%)**, and **Afforestation (10%)**.

```
sustainx-core/
├── apps/
│   └── web/                   # Next.js 15 Full-Stack App (Citizen PWA + Corporate ESG Portal)
│       ├── prisma/            # SQLite/PostgreSQL schema with auto-seed
│       └── src/
│           ├── app/           # App Router (/dashboard, /verify, /feed, /corporate)
│           ├── components/    # Reusable UI widgets (ScoreGauge, AqiBadge, VerificationBadge)
│           └── lib/           # Scoring fallback engine + cryptographic helpers
├── services/
│   └── ai-dmrv/               # Python FastAPI Micro-dMRV & Anti-Spoofing Service
│       └── app/               # scoring.py, vision_dmrv.py, qr_transit.py, anomaly.py
├── contracts/                 # Hardhat Polygon Smart Contracts
│       └── contracts/         # SustainSBT.sol (ERC-5192) & SustainImpact.sol (ERC-1155)
└── iot-nodes/                 # Edge Hardware Firmware & Tabletop Simulator
    ├── esp32_smart_bin_meter.ino   # ESP32-CAM + HX711 Load Cell + PZEM-004T with HMAC-SHA256
    └── simulate_iot.py             # CLI Tabletop Hardware Simulator for Viva Demonstration
```

---

## 2. Mathematical Ecological Scoring Formula

Implemented in both `services/ai-dmrv/app/scoring.py` and `apps/web/src/lib/scoring-fallback.ts`:

$$S_{\text{total}}(u, t) = \lambda \cdot S_{\text{total}}(u, t-1) + (1 - \lambda) \cdot 1000 \cdot \sum_{k=1}^{5} \left[ w_k \cdot \sigma(Z_k(u, t)) \cdot C_k(u, t) \cdot M_{\text{AQI}}(t) \cdot I_{\text{fraud}}(u, t) \right]$$

- **Domain Weights ($w_k$):** Electricity ($0.30$), Waste ($0.25$), Transit ($0.20$), Water ($0.15$), Trees ($0.10$).
- **Per-Capita Baseline Z-Score ($Z_k$):** $Z_k = \frac{E_{\text{baseline}} - (E_{\text{actual}} / N_{\text{occupants}})}{\sigma_{\text{regional}}}$, mapped through logistic sigmoid $\sigma(z) = \frac{1}{1 + e^{-z}}$.
- **Verification Confidence ($C_k$):** HMAC IoT/BBPS ($1.00$), QR Ticket ($0.90$), CV Photo ($0.75$), Manual ($0.20$).
- **Dynamic AQI Bounty ($M_{\text{AQI}}$):** $1.25\times$ for AQI $\ge 4$ (Poor), $1.50\times$ for AQI $\ge 5$ (Very Poor).
- **Temporal Momentum ($\lambda = 0.85$):** Prevents gaming while enforcing habit persistence.

---

## 3. Legacy Code Audit & Surgical Refactoring

The legacy hackathon prototype (`devxaves/greenpratidin`) was cleaned and restructured:

| Legacy Folder | Critical Vulnerabilities / Defects Identified | SustainX 2.0 Resolution |
| :--- | :--- | :--- |
| `Home page Code/` | Hardcoded coordinates (`left: 1200px`), misnamed `package,json`, leaked Orkes RS256 JWT token in `script1.js`. | **DELETED 100%.** Replaced by responsive Next.js 15 landing page and dashboard shell. |
| `Carbon Footprint Tracker Code/` | Streamlit app with fatal Line 96 `SyntaxError` (`s t.error`). Naive linear emission model. | **MATH SALVAGED & DELETED.** Ported emission factors (`0.14`, `0.716`, `1.50`) into `scoring.py` & `scoring-fallback.ts`. |
| `AQI website code/` | Exposed OpenWeatherMap API key `cb56ff195ee41b1f65479953067cfbef` in client JS. | **DELETED.** Replaced with secure server-side route `/api/env/aqi` with Salt Lake `700091` fallback and $1.25\times$ Dynamic Bounty. |
| `Social Community Code/` | EOL MongoDB Data API calls (`/action/findOne`), 2000ms delay, NoSQL injection (`[req.body.action]`), broken navbar `preventDefault()`. | **REBUILT.** Rebuilt with Prisma ORM, Next.js App Router, and multi-part CV dMRV verification. |

---

## 4. Quick Start: 1-Command Boot

### Step 1: Initialize Database & Web App
```bash
# Navigate to web application directory
cd apps/web

# Install dependencies (runs cleanly with npm)
npm install

# Initialize SQLite database and seed 5 team members across all tiers
npx prisma db push
npx ts-node prisma/seed.ts

# Boot development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Note: The web platform contains a complete TypeScript fallback scoring engine, meaning all 4 portal views, verification forms, and anti-spoofing gates function out-of-the-box even without Python running).*

### Step 2: (Optional) Boot Python FastAPI Micro-dMRV Service
```bash
cd services/ai-dmrv
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 5. 3-Minute Live Viva Demonstration Walkthrough (For Examiners & Jury)

1. **[0:00 - 0:30] Citizen Ecological Dashboard (`/dashboard`):**
   - Open `/dashboard`. Present Deepak Kumar's **Platinum Civic Tier** and live **Soulbound Score Gauge** ($890/1000$).
   - Point out the Salt Lake Sector V AQI badge with the dynamic transit multiplier badge.
   - Switch profile dropdown to view Devpriya Mahato (Gold), Jashika Chourasia (Silver), or Md Imran (Bronze).
   - Click "Claim Rebate" to demonstrate instantaneous CESC electricity bill cashback deduction.

2. **[0:30 - 1:15] Action Verification Studio (`/verify`):**
   - **Tab 1 (BBPS):** Submit biller `CESC-KOLKATA` with CID `09128391024`. Observe automatic baseline delta reconciliation ($+32.2$ kg CO2e abated).
   - **Tab 2 (IoT):** Click *"Transmit Signed IoT Deposit Packet"*. Observe HMAC-SHA256 signature verification for a 480g PET Plastic smart bin deposit.
   - **Tab 3 (Transit):** Scan a Metro ticket from *Sector V* to *Sealdah* ($8.5$ km) and show carbon abated with the $1.25\times$ AQI multiplier.

3. **[1:15 - 2:00] Anti-Spoofing Gate Live Proof (`/verify` -> Tab 4):**
   - Click **"Test 1: Duplicate Image Spoof (pHash Collision)"**. The first image passes dMRV verification; the second attempt is visibly rejected with `ERR_DUPLICATE_IMAGE_SPOOF` (Hamming distance $\le 6$).
   - Click **"Test 2: QR Nonce Replay Attack"**. The second scan of the same ticket is blocked with `ERR_QR_NONCE_REPLAY`.

4. **[2:00 - 2:30] Verified Community Feed (`/feed`):**
   - Display the upgraded GreenPratidin Flutters feed with AI verification badges (`Verified by MobileNetV3`).
   - Use the fuzzy search bar to query posts by keyword ("Metro", "sapling").
   - Click the heart icon to demonstrate peer endorsement without NoSQL injection flaws.

5. **[2:30 - 3:00] Corporate ESG & EPR Buyout Portal (`/corporate`):**
   - Review the aggregate citizen abatement pool ($121.8$ kg CO2e, $35.3$ kg Plastic).
   - Click *"Retire Batch & Issue BRSR Certificate"*.
   - Present the resulting cryptographic retirement hash, polygon transaction receipt, and $80\%$ cashback distribution to citizen wallets.

---

## 6. Smart Contract Architecture

- **`SustainSBT.sol` (`ERC-5192` Non-Transferable Soulbound Token):**
  - Overrides internal transfer hooks to permanently revert on any transfer attempt with `ErrSoulboundNonTransferable()`.
  - Implements `locked(tokenId) = true` and updates civic scores upon off-chain proof settlement.
- **`SustainImpact.sol` (`ERC-1155` Fractional Micro-Credits):**
  - Token ID 1: Verified CO2 Grams ($1000\text{ units} = 1\text{ kg CO2e}$).
  - Token ID 2: Verified EPR Plastic Grams ($1000\text{ units} = 1\text{ kg plastic}$).
  - `retireBatch()` burns tokens and emits an immutable `ImpactBatchRetired` event with a deterministic SHA-256 certificate hash.

---

## 7. License

Distributed under the **MIT License**. Created for academic evaluation at Techno Main Salt Lake, Kolkata.
