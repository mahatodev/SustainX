import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SustainX 2.0 Database with Capstone Engineering Team...");

  // Clear existing
  await prisma.greenAction.deleteMany();
  await prisma.communityPost.deleteMany();
  await prisma.corporateRetirement.deleteMany();
  await prisma.user.deleteMany();

  // 5 Engineering Team Members across civic tiers
  const users = [
    {
      id: "usr_deepak_01",
      email: "deepak.kumar@technoindia.in",
      name: "Deepak Kumar",
      nickname: "deepak_dev",
      picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      walletAddress: "0x71C...49A2",
      householdSize: 4,
      pinCode: "700091",
      compositeScore: 890,
      tier: "PLATINUM",
      co2SavedGrams: 48500,
      plasticSavedGrams: 14200,
      rewardBalanceInr: 850.0,
      sbtTokenId: 101,
    },
    {
      id: "usr_devpriya_02",
      email: "devpriya.mahato@technoindia.in",
      name: "Devpriya Mahato",
      nickname: "devxaves",
      picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      walletAddress: "0x93B...28F1",
      householdSize: 3,
      pinCode: "700091",
      compositeScore: 745,
      tier: "GOLD",
      co2SavedGrams: 34200,
      plasticSavedGrams: 9800,
      rewardBalanceInr: 610.0,
      sbtTokenId: 102,
    },
    {
      id: "usr_jashika_03",
      email: "jashika.chourasia@technoindia.in",
      name: "Jashika Chourasia",
      nickname: "jashika_c",
      picture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      walletAddress: "0x32A...77C4",
      householdSize: 4,
      pinCode: "700064",
      compositeScore: 520,
      tier: "SILVER",
      co2SavedGrams: 19500,
      plasticSavedGrams: 5400,
      rewardBalanceInr: 340.0,
      sbtTokenId: 103,
    },
    {
      id: "usr_kirtan_04",
      email: "kirtan.kumar@technoindia.in",
      name: "Kirtan Kumar",
      nickname: "kirtan_k",
      picture: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      walletAddress: "0x44D...90E2",
      householdSize: 2,
      pinCode: "700091",
      compositeScore: 380,
      tier: "SILVER",
      co2SavedGrams: 13400,
      plasticSavedGrams: 4100,
      rewardBalanceInr: 220.0,
      sbtTokenId: 104,
    },
    {
      id: "usr_imran_05",
      email: "md.imran@technoindia.in",
      name: "Md Imran",
      nickname: "imran_eco",
      picture: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80",
      walletAddress: "0x19F...55A7",
      householdSize: 5,
      pinCode: "700102",
      compositeScore: 190,
      tier: "BRONZE",
      co2SavedGrams: 6200,
      plasticSavedGrams: 1800,
      rewardBalanceInr: 95.0,
      sbtTokenId: 105,
    },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // Seed Verified Green Actions
  await prisma.greenAction.createMany({
    data: [
      {
        userId: "usr_deepak_01",
        domain: "WASTE",
        verificationType: "IOT_SIGNED",
        rawValue: 520.0,
        co2EquivalentG: 780,
        confidenceWeight: 1.0,
        iotSignature: "hmac_verified_esp32_smart_bin_01",
        status: "VERIFIED",
        txHash: "0x892fca3b0192e441",
      },
      {
        userId: "usr_deepak_01",
        domain: "TRANSIT",
        verificationType: "QR_TICKET",
        rawValue: 14.5,
        co2EquivalentG: 2030,
        confidenceWeight: 0.90,
        aqiMultiplier: 1.25,
        qrNonceHash: "dmrc_kolkata_qr_nonce_hash_sample_01",
        status: "VERIFIED",
        txHash: "0x77ab09c41183aa21",
      },
      {
        userId: "usr_devpriya_02",
        domain: "ELECTRICITY",
        verificationType: "BBPS_API",
        rawValue: 45.0,
        co2EquivalentG: 32220,
        confidenceWeight: 1.0,
        status: "VERIFIED",
        txHash: "0xbbps901923019aa1",
      },
      {
        userId: "usr_devpriya_02",
        domain: "AFFORESTATION",
        verificationType: "CV_PHOTO",
        rawValue: 2.0,
        co2EquivalentG: 8708,
        confidenceWeight: 0.75,
        pHash: "9a8b7c6d5e4f3a2b",
        status: "VERIFIED",
        txHash: "0xcv88120391024bb3",
      },
      {
        userId: "usr_jashika_03",
        domain: "WATER",
        verificationType: "BBPS_API",
        rawValue: 800.0,
        co2EquivalentG: 272,
        confidenceWeight: 1.0,
        status: "VERIFIED",
        txHash: "0xkmc9102839102dd",
      },
    ],
  });

  // Seed Verified Flutters Posts
  await prisma.communityPost.createMany({
    data: [
      {
        userId: "usr_deepak_01",
        body: "Deposited 520g of segregated PET bottles into the Techno Main Campus Smart Bin node! Verified automatically on-chain via ESP32 load-cell sensor.",
        imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=600&q=80",
        pHash: "e1f2a3b4c5d6e7f8",
        cvLabel: "recyclable_plastic_bin",
        cvConfidence: 0.92,
        isVerifiedAction: true,
        likes: JSON.stringify(["usr_devpriya_02", "usr_jashika_03", "usr_kirtan_04"]),
      },
      {
        userId: "usr_devpriya_02",
        body: "Switched daily commute to the East-West Green Line Metro (Karunamoyee to Phoolbagan). 14.5 km saved ~2.03 kg of carbon emissions today with the 1.25x AQI bonus!",
        imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80",
        pHash: "c9d8e7f6a5b4c3d2",
        cvLabel: "metro_transit",
        cvConfidence: 0.89,
        isVerifiedAction: true,
        likes: JSON.stringify(["usr_deepak_01", "usr_imran_05"]),
      },
      {
        userId: "usr_jashika_03",
        body: "Planted 2 neem saplings near Central Park Salt Lake. Geotagged with EXIF proof, ready for the Day 30 survival inspection check-in.",
        imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80",
        pHash: "1122334455667788",
        cvLabel: "sapling_tree",
        cvConfidence: 0.94,
        isVerifiedAction: true,
        likes: JSON.stringify(["usr_deepak_01", "usr_devpriya_02"]),
      },
    ],
  });

  // Seed Corporate Retirements
  await prisma.corporateRetirement.create({
    data: {
      corporateName: "Wipro Technologies (Salt Lake SEZ)",
      brsrReference: "SEBI-BRSR-2026-Q2-WIPRO",
      co2RetiredKg: 125.0,
      plasticRetiredKg: 50.0,
      amountPaidInr: 7500.0,
      certificateHash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
      txHash: "0xpolygon99887766554433221100aabbccddeeff",
    },
  });

  console.log("✅ Seed completed successfully with 5 users, green actions, flutters, and corporate retirement!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
