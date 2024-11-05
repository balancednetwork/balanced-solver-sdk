import type { Address } from "viem"

export type ChainType = "evm" | "sui"
export type Chain = "sui" | "arb"
export type ChainInfo<T extends ChainType> = {
  name: Chain
  type: T
}

export type EvmChainConfig = {
  chain: ChainInfo<"evm">
  nid: string
} & {
  intentContract: Address
  nativeToken: Address
}

export type SuiChainConfig = {
  chain: ChainInfo<"sui">
  nid: string
} & {
  packageId: string
  storageId: string
  nativeToken: string
}

export type ChainConfig = EvmChainConfig | SuiChainConfig

export type Result<T, E = Error | unknown> = { ok: true; value: T } | { ok: false; error: E }

export type SuiNetworkType = "mainnet" | "testnet" | "devnet" | "localnet"
