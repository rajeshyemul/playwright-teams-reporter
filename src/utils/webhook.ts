import type {
  SendToTeamsOptions,
  SendToTeamsResult,
  TeamsMessagePayload
} from "../types"

const DEFAULT_MAX_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 2000

class WebhookError extends Error {
  constructor(message: string, readonly retryable: boolean) {
    super(message)
    this.name = "WebhookError"
  }
}

export async function sendToTeams(
  webhookUrl: string,
  payload: TeamsMessagePayload,
  options: SendToTeamsOptions = {}
): Promise<SendToTeamsResult> {
  const fetchFn = options.fetchFn ?? fetch
  const logger = options.logger ?? console
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
  const retryDelayMs = options.retryDelayMs ?? DEFAULT_RETRY_DELAY_MS

  let attemptCount = 0
  let lastError: Error | null = null
  let lastResponseBody: string | undefined
  let lastStatusCode: number | undefined

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    attemptCount = attempt + 1

    try {
      const response = await fetchFn(webhookUrl, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      })

      lastStatusCode = response.status

      if (!response.ok) {
        lastResponseBody = await response.text().catch(() => "(no body)")

        throw new WebhookError(
          `Teams webhook responded with ${response.status}: ${lastResponseBody}`,
          isRetryableStatus(response.status)
        )
      }

      lastResponseBody = await response.text()

      if (lastResponseBody !== "1") {
        logger.warn(
          `[playwright-teams-reporter] Unexpected Teams response body: "${lastResponseBody}"`
        )
      }

      return {
        attempts: attemptCount,
        delivered: true,
        responseBody: lastResponseBody,
        statusCode: response.status
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const retryable = !(error instanceof WebhookError) || error.retryable

      if (retryable && attempt < maxRetries) {
        logger.warn(
          `[playwright-teams-reporter] Webhook attempt ${attempt + 1} failed. Retrying in ${retryDelayMs}ms...`
        )

        await sleep(retryDelayMs)
        continue
      }

      break
    }
  }

  logger.error(
    `[playwright-teams-reporter] Failed to send to Teams after ${attemptCount} attempts: ${lastError?.message}`
  )

  return {
    attempts: attemptCount,
    delivered: false,
    errorMessage: lastError?.message,
    responseBody: lastResponseBody,
    statusCode: lastStatusCode
  }
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500
}

function sleep(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs))
}
