import { type Address, type Hash } from "viem"
import type { ChainName, ChainConfig, ChainType, Result } from "../types.js"
import { chainConfig, supportedChains } from "../constants.js"
import { isEvmChainConfig, isSuiChainConfig } from "../guards.js"
import { type ChainProvider, type NonEmptyChainProviders, EvmProvider, SuiProvider } from "../entities/index.js"
import { EvmIntentService } from "./EvmIntentService.js"
import { SuiIntentService } from "./SuiIntentService.js"

export type IntentQuoteRequest = {
  srcNID: string
  dstNID: string
  token: Address
  amount: string
  toToken: Address
}

export type IntentQuoteResponse = {
  quote: string
  uuid: string
}

export type IntentExecutionRequest = {
  uuid: string
  txHash: string
}

export type IntentExecutionResponse = {
  message: string
  code: number
}

export type CreateIntentOrderPayload = {
  fromAddress: string
  toAddress: string
  fromChain: ChainName
  toChain: ChainName
  token: string
  amount: bigint
  toToken: string
  toAmount: bigint
}

export class IntentService {
  private readonly providers: NonEmptyChainProviders

  constructor(chainProviders: NonEmptyChainProviders) {
    this.providers = chainProviders
  }

  async getQuote(payload: IntentQuoteRequest): Promise<IntentQuoteResponse> {
    // TODO
    return Promise.resolve({} as IntentQuoteResponse)
  }

  /**
   * Check whether intent contract is allowed to move the given payload amount
   * @param payload -Intent payload
   */
  public async isAllowanceValid(payload: CreateIntentOrderPayload): Promise<Result<boolean>> {
    try {
      const fromChainConfig = chainConfig[payload.fromChain]

      if (!fromChainConfig) {
        return {
          ok: false,
          error: `Unsupported fromChain: ${payload.fromChain}`,
        }
      }

      if (isEvmChainConfig(fromChainConfig)) {
        return EvmIntentService.isAllowanceValid(
          payload.token as Address,
          payload.amount,
          payload.fromAddress as Address,
          fromChainConfig,
          this.getChainProvider(fromChainConfig.chain.type),
        )
      } else if (isSuiChainConfig(fromChainConfig)) {
        // no allowance required on SUI
        return {
          ok: true,
          value: true,
        }
      } else {
        return {
          ok: false,
          error: new Error(`${payload.fromChain} chain not supported`),
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: e,
      }
    }
  }

  public async executeIntentOrder(payload: CreateIntentOrderPayload): Promise<Result<any>> {
    try {
      const txHash = await this.createIntentOrder(payload)

      // TODO

      return {
        ok: true,
        value: undefined,
      }
    } catch (e) {
      return {
        ok: false,
        error: e,
      }
    }
  }

  private async createIntentOrder(payload: CreateIntentOrderPayload): Promise<Result<Hash | string>> {
    try {
      const fromChainConfig = chainConfig[payload.fromChain]

      if (!fromChainConfig) {
        return {
          ok: false,
          error: new Error(`Unsupported fromChain: ${payload.fromChain}`),
        }
      }

      const toChainConfig = chainConfig[payload.toChain]

      if (!toChainConfig) {
        return {
          ok: false,
          error: new Error(`Unsupported toChainConfig: ${toChainConfig}`),
        }
      }

      if (isEvmChainConfig(fromChainConfig)) {
        return EvmIntentService.createIntentOrder(
          payload,
          fromChainConfig,
          toChainConfig,
          this.getChainProvider(fromChainConfig.chain.type),
        )
      } else if (isSuiChainConfig(fromChainConfig)) {
        return SuiIntentService.createIntentOrder(
          payload,
          fromChainConfig,
          toChainConfig,
          this.getChainProvider(fromChainConfig.chain.type),
        )
      } else {
        return {
          ok: false,
          error: new Error(`${payload.fromChain} chain not supported`),
        }
      }
    } catch (e) {
      return {
        ok: false,
        error: e,
      }
    }
  }

  private getChainProvider<T extends ChainType>(chainType: T): ChainProvider<T> {
    for (const p of this.providers) {
      if (p instanceof EvmProvider && chainType == "evm") {
        return p as ChainProvider<T>
      } else if (p instanceof SuiProvider && chainType == "sui") {
        return p as ChainProvider<T>
      }
    }

    throw new Error(`Unsupported chain type: ${chainType}`)
  }

  public static getSupportedChains(): ChainName[] {
    return supportedChains
  }

  public static getChainConfig(chain: ChainName): ChainConfig {
    const data = chainConfig[chain]

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    return data
  }
}
