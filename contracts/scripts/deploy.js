// scripts/deploy.js
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString()
  );

  // ── Deploy SustainSBT ─────────────────────────────────────
  const SustainSBT = await hre.ethers.getContractFactory("SustainSBT");
  const sustainSBT = await SustainSBT.deploy();
  await sustainSBT.waitForDeployment();
  const sbtAddress = await sustainSBT.getAddress();
  console.log("SustainSBT deployed to:", sbtAddress);

  // ── Deploy SustainImpact ──────────────────────────────────
  const metadataURI = "https://greenpratidin.io/metadata/{id}.json"; // placeholder
  const SustainImpact = await hre.ethers.getContractFactory("SustainImpact");
  const sustainImpact = await SustainImpact.deploy(metadataURI);
  await sustainImpact.waitForDeployment();
  const impactAddress = await sustainImpact.getAddress();
  console.log("SustainImpact deployed to:", impactAddress);

  // ── Save addresses ────────────────────────────────────────
  const addresses = {
    network: hre.network.name,
    deployer: deployer.address,
    SustainSBT: sbtAddress,
    SustainImpact: impactAddress,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, `${hre.network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to", outPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
