import {
  type Account,
  type Address,
  type Chain,
  createPublicClient,
  createWalletClient,
  custom,
  type CustomTransport,
  type PublicClient,
  type WalletClient,
} from "viem"
import { type Wallet, type WalletAccount } from "@mysten/wallet-standard"
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client"
import type { ChainName, ChainType, SuiNetworkType } from "../types.js"
import { getEvmViemChain } from "../constants.js"

export type CustomProvider = { request(...args: any): Promise<any> }

export class EvmProvider {
  public readonly walletClient: WalletClient<CustomTransport, Chain, Account>
  public readonly publicClient: PublicClient<CustomTransport>

  constructor(userAddress: Address, chain: ChainName, provider: CustomProvider) {
    this.walletClient = createWalletClient({
      account: userAddress,
      transport: custom(provider),
      chain: getEvmViemChain(chain),
    })
    this.publicClient = createPublicClient({
      transport: custom(provider),
      chain: getEvmViemChain(chain),
    })

    console.log("Evm provider initialised with chain id:", this.walletClient.chain.id)
  }
}

export class SuiProvider {
  public readonly wallet: Wallet
  public readonly account: WalletAccount
  public readonly client: SuiClient

  constructor(wallet: Wallet, account: WalletAccount, net: SuiNetworkType) {
    this.wallet = wallet
    this.account = account
    this.client = new SuiClient({ url: getFullnodeUrl(net) })
  }
}

export type ChainProviderType = EvmProvider | SuiProvider

export type ChainProvider<T extends ChainType | undefined = undefined> = T extends "evm"
  ? EvmProvider
  : T extends "sui"
    ? SuiProvider
    : ChainProviderType

export type GetChainProviderType<T extends ChainName> = T extends "arb"
  ? ChainProvider<"evm">
  : T extends "sui"
    ? ChainProvider<"sui">
    : never

export type NonEmptyChainProviders = [ChainProvider, ...ChainProvider[]]
