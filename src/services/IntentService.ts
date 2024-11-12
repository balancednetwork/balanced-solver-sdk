import { type Address, type Hash } from "viem"
import {
  type ChainName,
  type ChainConfig,
  type Result,
  type IntentQuoteRequest,
  type IntentQuoteResponse,
  type CreateIntentOrderPayload,
  type IntentErrorResponse,
  type IntentExecutionResponse,
  type IntentStatusRequest,
  type IntentStatusResponse,
} from "../types.js"
import { chainConfig, supportedChains } from "../constants.js"
import { isEvmChainConfig, isSuiChainConfig } from "../guards.js"
import { EvmProvider, SuiProvider, type GetChainProviderType } from "../entities/index.js"
import { EvmIntentService } from "./EvmIntentService.js"
import { SuiIntentService } from "./SuiIntentService.js"
import { SolverApiService } from "./SolverApiService.js"
import invariant from "tiny-invariant"

export class IntentService {
  private constructor() {}

  /**
   * Get current best quote for token amount
   * @example
   * // request
   * {
   *     "token_src": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
   *     "token_src_blockchain_id": "42161",
   *     "token_dst": "0x2::sui::SUI",
   *     "token_dst_blockchain_id": "101",
   *     "src_amount": "0.00001"
   * }
   *
   * // response
   * {
   *   "ok": true,
   *   "value": {
   *      "output": {
   *        "expected_output":"0.009813013",
   *        "uuid":"e2795d2c-14a5-4d18-9be6-a257d7c9d274"
   *      }
   *   }
   * }
   */
  public static async getQuote(payload: IntentQuoteRequest): Promise<Result<IntentQuoteResponse, IntentErrorResponse>> {
    return SolverApiService.getQuote(payload)
  }

  /**
   * Check whether intent contract is allowed to move the given payload amount
   * @param payload -Intent payload
   * @param provider - ChainProviderType
   * @return Boolean - valid = true, invalid = false
   */
  public static async isAllowanceValid<T extends CreateIntentOrderPayload>(
    payload: CreateIntentOrderPayload,
    provider: GetChainProviderType<T["fromChain"]>,
  ): Promise<Result<boolean>> {
    invariant(payload.amount > 0n, "Invalid amount")
    invariant(payload.amount > 0n, "Invalid amount")

    try {
      const fromChainConfig = chainConfig[payload.fromChain]

      if (!fromChainConfig) {
        return {
          ok: false,
          error: `Unsupported fromChain: ${payload.fromChain}`,
        }
      }

      if (isEvmChainConfig(fromChainConfig)) {
        if (provider instanceof EvmProvider) {
          return EvmIntentService.isAllowanceValid(
            payload.token as Address,
            payload.amount,
            payload.fromAddress as Address,
            fromChainConfig,
            provider,
          )
        } else {
          return {
            ok: false,
            error: new Error(`[IntentService.isAllowanceValid] provider should be of type EvmProvider`),
          }
        }
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

  /**
   * Execute intent order
   * @example
   * // request
   * {
   *     "intent_tx_hash": "0xba3dce19347264db32ced212ff1a2036f20d9d2c7493d06af15027970be061af",
   *     "quote_uuid": "a0dd7652-b360-4123-ab2d-78cfbcd20c6b"
   * }
   *
   * // response
   * {
   *   "ok": true,
   *   "value": {
   *      "output": {
   *        "answer":"OK",
   *        "task_id":"a0dd7652-b360-4123-ab2d-78cfbcd20c6b"
   *      }
   *   }
   * }
   */
  public static async executeIntentOrder<T extends CreateIntentOrderPayload>(
    payload: CreateIntentOrderPayload,
    provider: GetChainProviderType<T["fromChain"]>,
  ): Promise<Result<IntentExecutionResponse, IntentErrorResponse | Error | unknown>> {
    try {
      const intentOrderResult = await IntentService.createIntentOrder(payload, provider)

      if (intentOrderResult.ok) {
        return SolverApiService.postExecution({
          intent_tx_hash: intentOrderResult.value,
          quote_uuid: payload.quote_uuid,
        })
      } else {
        return intentOrderResult
      }
    } catch (e: any) {
      return {
        ok: false,
        error: e,
      }
    }
  }

  private static async createIntentOrder<T extends CreateIntentOrderPayload>(
    payload: T,
    provider: GetChainProviderType<T["fromChain"]>,
  ): Promise<Result<Hash | string>> {
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
          error: new Error(`Unsupported toChain: ${payload.toChain}`),
        }
      }

      if (isEvmChainConfig(fromChainConfig)) {
        if (provider instanceof EvmProvider) {
          return EvmIntentService.createIntentOrder(payload, fromChainConfig, toChainConfig, provider)
        } else {
          return {
            ok: false,
            error: new Error(`[IntentService.createIntentOrder] provider should be of type EvmProvider`),
          }
        }
      } else if (isSuiChainConfig(fromChainConfig)) {
        if (provider instanceof SuiProvider) {
          return SuiIntentService.createIntentOrder(payload, fromChainConfig, toChainConfig, provider)
        } else {
          return {
            ok: false,
            error: new Error(`[IntentService.createIntentOrder] provider should be of type SuiProvider`),
          }
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

  /**
   * Get current intent status
   * @example
   * // request
   * {
   *     "task_id": "a0dd7652-b360-4123-ab2d-78cfbcd20c6b"
   * }
   *
   * // response
   * {
   *   "ok": true,
   *   "value": {
   *      "output": {
   *        "status":3,
   *        "tx_hash":"0xabcdef"
   *      }
   *   }
   * }
   */
  public static async getStatus(
    intentStatusRequest: IntentStatusRequest,
  ): Promise<Result<IntentStatusResponse, IntentErrorResponse>> {
    return SolverApiService.getStatus(intentStatusRequest)
  }

  /**
   * Get all available chains supporting intents
   */
  public static getSupportedChains(): ChainName[] {
    return supportedChains
  }

  /**
   * Get config of a specific chain
   */
  public static getChainConfig(chain: ChainName): ChainConfig {
    const data = chainConfig[chain]

    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`)
    }

    return data
  }
}
