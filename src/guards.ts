import type { ChainConfig, EvmChainConfig, SuiChainConfig } from "./types.js"

export function isEvmChainConfig(value: ChainConfig): value is EvmChainConfig {
  return typeof value === "object" && value.chain.type == "evm"
}

export function isSuiChainConfig(value: ChainConfig): value is SuiChainConfig {
  return typeof value === "object" && value.chain.type == "sui"
}
