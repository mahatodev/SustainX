# Product Requirements Document (PRD): SustainX 2.0 (PROJ-IT781)

**Project Title:** SustainX: A Verified Personal Ecological Credit & Micro-dMRV Protocol  
**Course & Code:** B.Tech in Information Technology — Project-II (`PROJ-IT781`), Techno Main Salt Lake (MAKAUT)  
**Supervisor:** Mr. Soumitra Sasmal  
**Core Engineering Team:** Deepak Kumar (`13000223053`), Devpriya Mahato (`13000223055`), Jashika Chourasia (`13000223065`), Kirtan Kumar (`13000223069`), Md Imran (`13000223076`)  
**Repository Migration Strategy:** Clean-Slate Modular Monorepo (`sustainx-core`) salvaging validated domain logic (~18%) from legacy `devxaves/greenpratidin` while purging deprecated APIs and security vulnerabilities (~82%).

## 1. Executive Summary & Product Vision

Environmental incentive programs today are trapped in silos: corporate carbon registries cater exclusively to industrial emitters, gamified consumer apps like [Alipay Ant Forest](https://unfccc.int/climate-action/momentum-for-change/planetary-health/alipay-ant-forest) lock user points inside closed corporate ecosystems with symbolic rewards, and Move-to-Earn Web3 apps like [Sweatcoin](https://help.sweatco.in/hc/en-us/articles/51460165943569-What-s-Happening-to-Sweat-Wallet-and-Sweat) and [STEPN](https://www.kucoin.com/knowledge-base/Review/what-is-the-difference-between-stepn-and-sweatcoin) suffer from inflationary tokenomics unbacked by real buyer demand. Meanwhile, India's [MoEFCC Green Credit Programme (GCP)](https://www.moefcc-gcp.in/about/aboutGCP), notified under the Environment (Protection) Act ([PIB Notification](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2240640&reg=3&lang=1)), defines eight national sustainability verticals but lacks a citizen-scale **Digital Measurement, Reporting, and Verification (dMRV)** engine.

**SustainX 2.0** bridges this gap. It is a cross-domain citizen sustainability and micro-carbon aggregation platform that tracks and verifies everyday ecological actions across five verticals—**Electricity Conservation (30%), Waste Segregation (25%), Green Transit (20%), Water Conservation (15%), and Afforestation (10%)**—and converts them into two distinct on-chain assets on Polygon L2:
1. **`SustainID` (`ERC-5192` Non-Transferable Soulbound Token):** An immutable, non-tradable ecological credit score (`0–1000`) placing users into **Bronze (`0–299`)**, **Silver (`300–599`)**, **Gold (`600–849`)**, or **Platinum (`850–1000`)** civic tiers.
2. **`SX-Impact` (`ERC-1155` Semi-Fungible Micro-Credit):** Verified fractional impact units (`1 unit = 1 kg CO2e saved` or `1 kg segregated plastic`) that are pooled into community batches and purchased/retired by corporations to fulfill [Extended Producer Responsibility (EPR)](https://www.recykal.com/drs-platform) and SEBI BRSR/CSR mandates. Corporate buyout revenue directly funds citizen UPI/utility bill rebates and partner vouchers.

## 2. Legacy Repository Audit (`devxaves/greenpratidin`) — Keep, Refactor & Remove

The existing repository contains four disconnected folders built during an earlier hackathon (`Home page Code/`, `Social Community Code/`, `Carbon Footprint Tracker Code/`, and `AQI website code/`). An AI coding agent working on this repository must execute the following surgical migration rather than patching the legacy folders in place:

| Legacy Path | Current Implementation & Identified Bugs | Mandatory Action for SustainX 2.0 |
| :--- | :--- | :--- |
| `Home page Code/` (`index.html`, `index.css`, `package,json`, `script1.js`, `script2.js`) | Static landing page with hardcoded absolute pixel coordinates (`left: 1200px; top: 565px`), a misnamed `package,json` file, and a leaked Orkes Conductor RS256 JWT token on Line 5 of `script1.js`. | **DELETE 100%.** Replace with a responsive Next.js landing & dashboard shell in `apps/web/`. Revoke the leaked Orkes token. |
| `Carbon Footprint Tracker Code/app.py` | 96-line Streamlit slider app with `EMISSION_FACTORS` for India. Contains a fatal Python `SyntaxError` on Line 89 (`s t.error(...)` with a space inside `st`). | **SALVAGE MATH, DELETE STREAMLIT.** Port `EMISSION_FACTORS` and annual normalization math into `services/ai-dmrv/app/scoring.py`. Delete `Carbon Footprint Tracker Code/`. |
| `Social Community Code/pages/api/*` (`user/index.js`, `flutter/index.js`, `flutter/[term].js`, `flutter/like/index.js`) | Calls `process.env.MONGODB_DATA_API_URL` (`/action/findOne`, `insertOne`, `updateOne`, `aggregate`). Has a 2,000ms `setTimeout` on Line 16 of `user/index.js`, missing `filter` in `findOne`, and a NoSQL operator injection flaw (`[req.body.action]`) on Line 27 of `flutter/like/index.js`. | **REWRITE BACKEND WITH PRISMA.** The [MongoDB Atlas Data API](https://www.mongodb.com/docs/api/) reached permanent End-of-Life on September 30, 2025. Replace all Data API HTTP calls with Prisma ORM (`@prisma/client`). Salvage the `$search` fuzzy query structure from `flutter/[term].js`. |
| `Social Community Code/components/*` (`Navbar.js`, `Flutters/CreateFlutter.js`, `Flutters/Flutter.js`, `Profile.js`) | Mantine v4 social feed. `Navbar.js` Line 89 runs `event.preventDefault()` on all links, breaking external navigation. `CreateFlutter.js` (Line 82) and `Flutter.js` (Line 62) declare `var file=""` at module scope and store raw base64 images inside MongoDB arrays. | **REFACTOR INTO VERIFIED PROOF FEED.** Upgrade to Next.js App Router + Tailwind/Mantine. Fix navbar routing. Replace `react-file-base64` with multipart uploads sent through the FastAPI computer-vision anti-spoofing pipeline. |
| `AQI website code/` (`index.html`, `script.js`, `style.css`) | Client-side JS widget querying OpenWeatherMap Air Pollution API (`co`, `no`, `no2`, `o3`, `so2`, `pm2_5`, `pm10`, `nh3`). Exposes plaintext API key `cb56ff195ee41b1f65479953067cfbef` on Line 9 of `script.js`. | **CONVERT TO SERVER-SIDE MULTIPLIER.** Delete standalone folder. Move the 8-pollutant fetch into a Next.js server route (`/api/env/aqi`) using `process.env.OPENWEATHER_API_KEY`. Use high AQI readings (`>= 4`) as a `1.25x–1.5x` bonus multiplier for green transit & tree planting. |

## 3. Target Monorepo Architecture (`sustainx-core`)

Reorganize the project root into a clean, production-grade monorepo with four self-contained workspaces:

```text
sustainx-core/
├── PRD.md                              # This Product Requirements Document
├── README.md                           # Setup, architecture, and 3-minute demo guide
├── .env.example                        # Unified environment variable template
├── docker-compose.yml                  # Local orchestration (Web + FastAPI + MongoDB/Postgres)
├── apps/
│   └── web/                            # Next.js 15 Full-Stack Web App (Citizen PWA + Corporate ESG Portal)
│       ├── prisma/
│       │   └── schema.prisma           # Unified database schema (Users, GreenActions, UtilityBills, Batches)
│       ├── src/
│       │   ├── app/                    # Next.js App Router pages & API routes
│       │   │   ├── page.tsx            # Responsive Landing Page & Live Impact Ticker
│       │   │   ├── dashboard/          # Citizen Dashboard (5 Domains, Tier Progress, Leaderboard)
│       │   │   ├── feed/               # Refactored "Flutters" Verified Proof-of-Green-Work Community Feed
│       │   │   ├── corporate/          # B2B ESG/EPR Credit Batch Explorer & One-Click On-Chain Retirement
│       │   │   ├── verify/             # Action Submission Hub (BBPS Bill Fetch, QR Transit Scan, Smart Bin)
│       │   │   └── api/                # Next.js API Routes (Auth, Actions, BBPS Simulator, AQI Multiplier)
│       │   ├── components/             # Reusable UI components (Mantine / Tailwind + Lucide/Tabler icons)
│       │   └── lib/                    # Prisma client, Web3 contract ABI wrappers, anti-spoof helpers
├── services/
│   └── ai-dmrv/                        # Python FastAPI AI Scoring & Anti-Spoofing Microservice
│       ├── requirements.txt
│       └── app/
│           ├── main.py                 # FastAPI entrypoint & CORS middleware
│           ├── scoring.py              # Baseline-adjusted Z-score + temporal momentum calculator
│           ├── anomaly.py              # Scikit-learn IsolationForest bot & fraud detector
│           ├── vision_dmrv.py          # pHash duplicate check + EXIF GPS/time validator + MobileNetV3 classifier
│           └── qr_transit.py           # Metro/Bus ticket QR/OCR parser with nonce replay protection
├── contracts/                          # Solidity Smart Contracts (Hardhat / Polygon Amoy Testnet)
│   ├── hardhat.config.js
│   ├── contracts/
│   │   ├── SustainSBT.sol              # ERC-5192 Non-Transferable Soulbound Reputation & Tier Contract
│   │   └── SustainImpact.sol           # ERC-1155 Fractional Carbon/Plastic Micro-Credit & Batch Retirement
│   └── scripts/
│       └── deploy.js
└── iot-nodes/                          # Edge Hardware Firmware & Tabletop Simulator
    ├── esp32_smart_bin_meter.ino       # ESP32-CAM + HX711 Load Cell + PZEM-004T sketch with HMAC-SHA256
    └── simulate_iot.py                 # Python CLI simulator generating signed smart-bin & energy packets for live demos
```

## 4. Core Functional Modules & Detailed Feature Specifications

### Module 1: Zero-Friction Data Acquisition & Hardware-Signed IoT Layer
To solve the cold-start hardware barrier while supporting live IoT hardware demonstrations, implement three input channels:
1. **Bharat Connect (BBPS) Utility Bill Simulator (`POST /api/verify/utility`):**
   - Modeled on India's [Bharat Connect (BBPS)](https://www.bharat-connect.com/) bill-fetch standard.
   - Accepts `billerId` (e.g., `CESC-KOLKATA`, `WBSEDCL`, `KMC-WATER`), `consumerNumber`, and `householdOccupants`.
   - Fetches (or simulates via deterministic historical seed) the user's current month `kWh` / `Liters` against their 12-month historical baseline and regional seasonal average.
2. **Smart Segregation Bin & Energy Node (`POST /api/verify/iot`):**
   - Replaces the scientifically invalid `MQ-135` air quality sensor from the original synopsis with an **ESP32-CAM + HX711 Load Cell (weight in grams) + PZEM-004T (AC kWh) node**.
   - Every payload sent by the ESP32 (or `iot-nodes/simulate_iot.py`) must include `deviceId`, `userId`, `wasteType` (`PET_PLASTIC`, `PAPER`, `METAL`, `ORGANIC`), `weightGrams`, `energyKwh`, `timestamp`, and an `hmacSignature` computed via `HMAC-SHA256(payload, IOT_DEVICE_SECRET)`.
   - Rejects any packet with an invalid signature, timestamp drift `> 300 seconds`, or weight delta `< 20 grams`.
3. **Green Transit & Afforestation Check-In (`POST /api/verify/proof`):**
   - **Transit Mode:** Parses Metro/Bus QR ticket payloads (modeled on [DMRC CarbonLite Metro Travel](https://delhimetrorail.com/carbonlite-metro-travel)) containing `ticketId`, `originStation`, `destStation`, `distanceKm`, and `timestamp`. Stores `sha256(ticketId)` in the database so the same ticket can never be scanned twice.
   - **Afforestation & Cleanup Mode:** Accepts a photo upload (`multipart/form-data`), GPS coordinates, and action category. Passes the image to the FastAPI `vision_dmrv.py` service.

### Module 2: Tri-Modal Anti-Spoofing Engine ("Proof-of-Green-Work")
Implemented in `services/ai-dmrv/app/vision_dmrv.py` and `anomaly.py`. Every user submission is evaluated across three gates before points are awarded:
1. **Gate 1 — Perceptual Hash (`pHash`) & EXIF Metadata Verification:**
   - Computes a 64-bit perceptual hash (`imagehash.phash`) of every uploaded image and compares Hamming distance against all previously submitted images in the database. If `hamming_distance <= 6`, reject immediately with `ERR_DUPLICATE_IMAGE_SPOOF` (blocks users downloading photos from Google).
   - Extracts EXIF `DateTimeOriginal` and `GPSInfo` tags (with graceful fallback flag for desktop demo mode).
2. **Gate 2 — Computer Vision Classification:**
   - Uses a lightweight pre-trained `MobileNetV3` (or deterministic feature heuristic fallback when offline) to classify uploaded images into valid ecological categories (`sapling_tree`, `recyclable_plastic_bin`, `metro_ticket`, `solar_meter`) and outputs a confidence score `cv_confidence in [0.0, 1.0]`.
3. **Gate 3 — Behavioral Anomaly Detection (`IsolationForest`):**
   - Runs a `Scikit-learn IsolationForest` model over a user's rolling 7-day submission frequency, average hours between submissions, and variance in reported savings. Flags accounts exhibiting bot-like bursts (`I_fraud = 0` when anomalous, `1` when normal).

### Module 3: AI/ML Ecological Credit Scoring Engine (`services/ai-dmrv/app/scoring.py`)
Replaces naive raw-consumption scoring with a **Baseline-Adjusted, Per-Capita Normalized, Decay-Regularized Formula** on a `0 to 1000` scale:

$$S_{\text{total}}(u, t) = \lambda \cdot S_{\text{total}}(u, t-1) + (1 - \lambda) \cdot 1000 \cdot \sum_{k=1}^{5} \left[ w_k \cdot \sigma(Z_k(u, t)) \cdot C_k(u, t) \cdot M_{\text{AQI}}(t) \cdot I_{\text{fraud}}(u, t) \right]$$

- **Domain Weights ($w_k$):**
  - Electricity Conservation ($w_1 = 0.30$): `1 kWh saved = 0.716 kg CO2e` (CEA India Grid Baseline).
  - Waste Segregation ($w_2 = 0.25$): `1 kg segregated dry plastic/recyclable = 1.50 kg CO2e` + `1 EPR Plastic Unit`.
  - Sustainable Transit ($w_3 = 0.20$): `1 km Metro/Bus vs Car = 0.14 kg CO2e` (ported from `GreenPratidin/Carbon Footprint Tracker Code/app.py`).
  - Water Conservation ($w_4 = 0.15$): `1,000 Liters saved = 0.34 kg CO2e`.
  - Verified Afforestation ($w_5 = 0.10$): Credits vest across survival checks (`20%` Day 1 planting, `40%` Day 30 survival re-scan, `40%` Day 90 survival).
- **Per-Capita Baseline Z-Score ($Z_k$):**
  - $Z_k = \frac{E_{\text{baseline}} - (E_{\text{actual}} / N_{\text{occupants}})}{\sigma_{\text{regional}}}$, mapped to $[0, 1]$ via logistic sigmoid $\sigma(z) = \frac{1}{1 + e^{-z}}$ so large families are scored fairly against single-occupant rooms.
- **Verification Confidence Multiplier ($C_k \in [0.2, 1.0]$):**
  - Cryptographically signed IoT / BBPS API = `1.0`
  - QR-verified Metro/Bus ticket = `0.9`
  - CV + EXIF Geotag + 3 Community Likes on Feed = `0.75`
  - Unverified manual slider entry = `0.20`
- **Dynamic Regional AQI Multiplier ($M_{\text{AQI}} \in [1.0, 1.5]$):**
  - Ported from `GreenPratidin/AQI website code/script.js`: when local OpenWeatherMap AQI is `4 (Poor)` or `5 (Very Poor)`, green transit and afforestation actions receive a `1.25x` to `1.50x` multiplier (capped so total score never exceeds `1000`).
- **Temporal Momentum ($\lambda = 0.85$):** Rewards sustained monthly habits while decaying inactive accounts by 15% per cycle.

### Module 4: Dual-Token Blockchain Architecture (`contracts/`)
1. **`SustainSBT.sol` (`ERC-5192` Minimal Soulbound Token):**
   - Implements `locked(uint256 tokenId) external view returns (bool)` always returning `true`.
   - Overrides `_update` / transfer functions to revert with `ErrSoulboundNonTransferable()` on any non-mint transfer attempt.
   - Stores `struct CitizenScore { uint16 score; uint8 tier; uint64 lastUpdated; bytes32 latestProofHash; }` where `tier` is `0 (Bronze: 0–299)`, `1 (Silver: 300–599)`, `2 (Gold: 600–849)`, `3 (Platinum: 850–1000)`.
2. **`SustainImpact.sol` (`ERC-1155` Fractional Impact & Batch Retirement):**
   - Token ID `1`: `VERIFIED_CO2_GRAMS` (`1000 units = 1 kg CO2e`).
   - Token ID `2`: `VERIFIED_EPR_PLASTIC_GRAMS` (`1000 units = 1 kg segregated plastic`).
   - Includes `retireBatch(uint256 tokenId, uint256 amount, string calldata corporateEntityName, string calldata brsrReportRef)` which burns the fractional credits, emits an immutable `ImpactBatchRetired` event with a verifiable certificate hash, and allocates 80% of the buyout pool to participating citizens.

### Module 5: Citizen PWA, Refactored "Flutters" Community Feed & Corporate ESG Portal (`apps/web/`)
1. **Citizen Sustainability Dashboard (`/dashboard`):**
   - Displays the user's live Soulbound Tier badge (`Bronze` / `Silver` / `Gold` / `Platinum`), composite score (`0–1000`), domain breakdown radar/bar charts, regional AQI multiplier badge, and redeemable `SX-Impact` wallet balance (redeemable for simulated CESC/WBSEDCL electricity bill rebates, Metro smart-card top-ups, and eco-brand vouchers).
2. **Verified Community Feed (`/feed` — Upgraded from GreenPratidin `Flutters`):**
   - Users post cleanup drives, segregated waste drops, and sapling plantations with photos.
   - Each post card displays an **AI dMRV Verification Badge** (`Verified by MobileNetV3 • pHash Unique • +45 SX-Impact`) and allows neighborhood peers to endorse (`Like` / `Verify`) the post.
   - Includes the fuzzy search bar (`HeaderSearch`) ported from GreenPratidin.
3. **Corporate ESG & EPR Buyout Portal (`/corporate`):**
   - Allows corporate CSR/EPR buyers or campus administrators (e.g., Techno Main Salt Lake Green Cell) to inspect aggregated citizen carbon/plastic batches, verify the underlying anonymised proof hashes, and click **"Retire Batch & Fund Citizen Rewards"** on-chain.
4. **3-Minute Judge Demo Mode (`/verify`):**
   - Built-in interactive testbed with three one-click judge buttons:
     - **"Simulate Live ESP32 Smart Bin + BBPS Bill Fetch"** (triggers valid signed payload -> updates score & mints credits).
     - **"Simulate Spoof Attack (Duplicate Google Tree Photo / Replayed Metro QR)"** (visibly triggers the red `EXIF_MISSING / PHASH_COLLISION / QR_NONCE_REPLAY` security alert and blocks minting).
     - **"Execute Corporate EPR Batch Buyout"** (triggers on-chain retirement receipt and distributes cashback to citizen wallets).

## 5. Unified Database Schema (`apps/web/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql" // Or "mongodb" if using MongoDB Atlas connection string
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String        @id @default(cuid())
  email             String        @unique
  name              String
  nickname          String
  picture           String?
  walletAddress     String?       @unique
  householdSize     Int           @default(3)
  pinCode           String        @default("700091")
  compositeScore    Int           @default(120)
  tier              String        @default("BRONZE") // BRONZE, SILVER, GOLD, PLATINUM
  co2SavedGrams     Int           @default(0)
  plasticSavedGrams Int           @default(0)
  rewardBalanceInr  Float         @default(0.0)
  sbtTokenId        Int?
  actions           GreenAction[]
  posts             CommunityPost[]
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model GreenAction {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  domain            String   // ELECTRICITY, WASTE, TRANSIT, WATER, AFFORESTATION
  verificationType  String   // BBPS_API, IOT_SIGNED, QR_TICKET, CV_PHOTO, MANUAL
  rawValue          Float    // kWh, grams, km, liters, or sapling count
  co2EquivalentG    Int
  confidenceWeight  Float    // 0.2 to 1.0
  aqiMultiplier     Float    @default(1.0)
  pHash             String?  @unique
  qrNonceHash       String?  @unique
  iotSignature      String?
  status            String   @default("VERIFIED") // VERIFIED, REJECTED_SPOOF, FLAGGED_ANOMALY
  rejectionReason   String?
  txHash            String?
  createdAt         DateTime @default(now())
}

model CommunityPost {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  body              String
  imageUrl          String?
  pHash             String?
  cvLabel           String?
  cvConfidence      Float?
  isVerifiedAction  Boolean  @default(false)
  likes             String[] // Array of user IDs who endorsed the post
  postedAt          DateTime @default(now())
}

model CorporateRetirement {
  id                String   @id @default(cuid())
  corporateName     String
  brsrReference     String
  co2RetiredKg      Float
  plasticRetiredKg  Float
  amountPaidInr     Float
  certificateHash   String   @unique
  txHash            String
  createdAt         DateTime @default(now())
}
```

## 6. Acceptance Criteria & Verification Checklist

1. **Zero Legacy Dead Endpoints:** `grep -rn "MONGODB_DATA_API_URL" .` and `grep -rn "cb56ff195ee41b1f65479953067cfbef" .` and `grep -rn "orkesConductorClient" .` must return zero matches across the entire repository.
2. **All 5 Domains Functional End-to-End:** Submitting an action in Electricity (BBPS), Waste (ESP32 Smart Bin simulator), Transit (Metro QR), Water, or Afforestation (Photo upload) dynamically recalculates $S_{\text{total}}(u, t)$, updates the user's tier (`Bronze`/`Silver`/`Gold`/`Platinum`), and logs a verifiable proof hash.
3. **Live Anti-Spoofing Rejection:** Uploading the same image twice or re-submitting the same Metro ticket ID immediately returns a structured `REJECTED_SPOOF` response (`PHASH_COLLISION` or `QR_NONCE_REPLAY`) and awards `0` points.
4. **Smart Contracts Compile & Pass Tests:** `SustainSBT.sol` (`ERC-5192`) blocks token transfers while allowing score/tier updates, and `SustainImpact.sol` (`ERC-1155`) mints and retires fractional carbon/EPR batches cleanly.
