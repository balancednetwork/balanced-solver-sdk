import type { ChainConfig, ChainName, EvmChainConfig, SuiChainConfig } from "./types.js"

export const SOLVER_API_ENDPOINT = "localhost:3000" // TODO

export const chainConfig: Record<ChainName, ChainConfig> = {
  ["arb"]: {
    chain: {
      name: "arb",
      type: "evm",
    },
    nid: "0xa4b1.arbitrum",
    intentContract: "0x1d70D0B9c6b0508E7Bd2B379735CFF035749f187",
    nativeToken: "0x0000000000000000000000000000000000000000",
    supportedTokens: [
      {
        symbol: "ETH",
        decimals: 18,
        address: "0x0000000000000000000000000000000000000000",
      },
      {
        symbol: "WETH",
        decimals: 18,
        address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      },
    ],
  } satisfies EvmChainConfig,
  ["sui"]: {
    chain: {
      name: "sui",
      type: "sui",
    },
    nid: "sui",
    packageId: "0xbf8044a8f498b43e48ad9ad8a7d23027a45255903e8b4765dda38da2d1b89600",
    storageId: "0x78e96d7acd208baba0c37c1fd5d193088fa8f5ea45d18fa4c32eb3721307529d",
    nativeToken: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
    supportedTokens: [
      {
        symbol: "SUI",
        decimals: 9,
        address: "0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI",
      },
    ],
  } satisfies SuiChainConfig,
} as const

export const supportedChains: ChainName[] = Object.keys(chainConfig) as ChainName[]
