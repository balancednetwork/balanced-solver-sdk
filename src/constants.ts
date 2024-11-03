import type { ChainConfig, Chain, EvmChainConfig, SuiChainConfig } from "./types.js"

export const SOLVER_API_ENDPOINT = "localhost:3000" // TODO

export const chainConfig: Record<Chain, ChainConfig> = {
  ["arb"]: {
    chain: {
      name: "arb",
      type: "evm",
    },
    nid: "0xaa37dc.arbitrum",
    intentContract: "0x1d70D0B9c6b0508E7Bd2B379735CFF035749f187",
    nativeToken: "0x0000000000000000000000000000000000000000",
  } satisfies EvmChainConfig,
  ["sui"]: {
    chain: {
      name: "sui",
      type: "sui",
    },
    nid: "sui",
    packageId: "0x2604cc95ad0b2a3e4b2e9e5df8d7a59b8a20ccb4fda58cc6fd7d06777e283a6f",
    storageId: "0x490f1dbd44fd9bb1bd8fe8438bd8cb062acad8d81915fefc042f5484de7a7edc",
    nativeToken: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
  } satisfies SuiChainConfig,
} as const

export const supportedChains: Chain[] = Object.keys(chainConfig) as Chain[]
