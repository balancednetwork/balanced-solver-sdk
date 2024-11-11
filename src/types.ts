import type { Address } from "viem"

export type ChainType = "evm" | "sui"
export type ChainName = "sui" | "arb"
export type ChainInfo<T extends ChainType> = {
  name: ChainName
  type: T
}

export type Token = {
  symbol: string
  decimals: number
  address: string
}

export type BaseChainConfig<T extends ChainType> = {
  chain: ChainInfo<T>
  nid: string
  supportedTokens: Token[]
}

export type EvmChainConfig = BaseChainConfig<"evm"> & {
  intentContract: Address
  nativeToken: Address
}

export type SuiChainConfig = BaseChainConfig<"sui"> & {
  packageId: string
  storageId: string
  nativeToken: string
}

export type ChainConfig = EvmChainConfig | SuiChainConfig

export type Result<T, E = Error | unknown> = { ok: true; value: T } | { ok: false; error: E }

export type SuiNetworkType = "mainnet" | "testnet" | "devnet" | "localnet"
