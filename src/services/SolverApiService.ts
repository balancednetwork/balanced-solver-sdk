import { SOLVER_API_ENDPOINT } from "../constants.js"
import {
  IntentErrorCode,
  type IntentExecutionRequest,
  type IntentErrorResponse,
  type IntentQuoteRequest,
  type IntentQuoteResponse,
  type IntentExecutionResponse,
  type IntentStatusRequest,
  type IntentStatusResponse,
  type Result,
} from "../types.js"
import invariant from "tiny-invariant"

export class SolverApiService {
  private constructor() {}

  public static async getQuote(
    intentQuoteRequest: IntentQuoteRequest,
  ): Promise<Result<IntentQuoteResponse, IntentErrorResponse>> {
    invariant(intentQuoteRequest.token_src.length > 0, "Empty token_src")
    invariant(intentQuoteRequest.token_src_blockchain_id.length > 0, "Empty token_src_blockchain_id")
    invariant(intentQuoteRequest.token_dst.length > 0, "Empty token_dst")
    invariant(intentQuoteRequest.token_dst_blockchain_id.length > 0, "Empty token_dst_blockchain_id")
    invariant(+intentQuoteRequest.src_amount > 0, "Invalid src_amount amount")

    try {
      const response = await fetch(`${SOLVER_API_ENDPOINT}/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentQuoteRequest),
      })

      if (!response.ok) {
        return {
          ok: false,
          error: await response.json(),
        }
      }

      return {
        ok: true,
        value: await response.json(),
      }
    } catch (e: any) {
      console.error(`[SolverApiService.getQuote] failed. Details: ${JSON.stringify(e)}`)
      return {
        ok: false,
        error: {
          detail: {
            code: IntentErrorCode.UNKNOWN,
            message: e ? (e.message ?? JSON.stringify(e)) : "Unknown error",
          },
        },
      }
    }
  }

  public static async postExecution(
    intentExecutionRequest: IntentExecutionRequest,
  ): Promise<Result<IntentExecutionResponse, IntentErrorResponse>> {
    try {
      const response = await fetch(`${SOLVER_API_ENDPOINT}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentExecutionRequest),
      })

      if (!response.ok) {
        return {
          ok: false,
          error: await response.json(),
        }
      }

      return {
        ok: true,
        value: await response.json(),
      }
    } catch (e: any) {
      console.error(`[SolverApiService.postExecution] failed. Details: ${JSON.stringify(e)}`)
      return {
        ok: false,
        error: {
          detail: {
            code: IntentErrorCode.UNKNOWN,
            message: e ? (e.message ?? JSON.stringify(e)) : "Unknown error",
          },
        },
      }
    }
  }

  public static async getStatus(
    intentStatusRequest: IntentStatusRequest,
  ): Promise<Result<IntentStatusResponse, IntentErrorResponse>> {
    invariant(intentStatusRequest.task_id.length > 0, "Empty task_id")
    try {
      const response = await fetch(`${SOLVER_API_ENDPOINT}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(intentStatusRequest),
      })

      if (!response.ok) {
        return {
          ok: false,
          error: await response.json(),
        }
      }

      return {
        ok: true,
        value: await response.json(),
      }
    } catch (e: any) {
      console.error(`[SolverApiService.getStatus] failed. Details: ${JSON.stringify(e)}`)
      return {
        ok: false,
        error: {
          detail: {
            code: IntentErrorCode.UNKNOWN,
            message: e ? (e.message ?? JSON.stringify(e)) : "Unknown error",
          },
        },
      }
    }
  }
}
