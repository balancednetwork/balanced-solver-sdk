import {
  type Account,
  type Address,
  createPublicClient,
  createWalletClient,
  custom,
  type CustomTransport,
  type PublicClient,
  type WalletClient,
} from "viem"

export type CustomProvider = { request(...args: any): Promise<any> }

export class EvmProvider {
  public readonly walletClient: WalletClient<CustomTransport, undefined, Account>
  public readonly publicClient: PublicClient<CustomTransport>

  constructor(userAddress: Address, provider: CustomProvider) {
    this.walletClient = createWalletClient({
      account: userAddress,
      transport: custom(provider),
    })
    this.publicClient = createPublicClient({
      transport: custom(provider),
    })
  }
}

export class SuiProvider {
  // TODO
}

export type ChainProviderType = EvmProvider | SuiProvider

export type ChainProvider<T = undefined> = T extends "evm"
  ? EvmProvider
  : T extends "sui"
    ? SuiProvider
    : ChainProviderType
