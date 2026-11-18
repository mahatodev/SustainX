require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const DEPLOYER_PRIVATE_KEY =
  process.env.DEPLOYER_PRIVATE_KEY ||
  "0x0000000000000000000000000000000000000000000000000000000000000001"; // fallback for compile-only

const POLYGON_AMOY_RPC =
  process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      // Local in-memory network (default)
    },
    polygonAmoy: {
      url: POLYGON_AMOY_RPC,
      accounts: [DEPLOYER_PRIVATE_KEY],
      chainId: 80002,
    },
  },
};
