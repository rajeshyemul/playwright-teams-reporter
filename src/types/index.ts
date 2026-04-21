export type TestStatusValue =
  | "PASSED"
  | "FAILED"
  | "SKIPPED"
  | "FLAKY"
  | "TIMEDOUT"
  | "INTERRUPTED"

export const TestStatus = {
  PASSED: "PASSED",
  FAILED: "FAILED",
  SKIPPED: "SKIPPED",
  FLAKY: "FLAKY",
  TIMEDOUT: "TIMEDOUT",
  INTERRUPTED: "INTERRUPTED"
} as const satisfies Record<TestStatusValue, TestStatusValue>

export const StatusEmoji = {
  PASSED: "✅",
  FAILED: "❌",
  SKIPPED: "⏭️",
  FLAKY: "⚠️",
  TIMEDOUT: "⏱️",
  INTERRUPTED: "🚫"
} as const satisfies Record<TestStatusValue, string>

export interface TestCase {
  failureMessage?: string
  name: string
  retries?: number
  status: TestStatusValue
  tags?: string[]
  time: number
}

export interface ResultData {
  date: string
  duration: string
  environment: string
  estimatedTime?: string
  failed: number
  flaky?: number
  reportUrl?: string
  skip: number
  success: number
  summary: string
  testCases: TestCase[]
  testCycleId?: string
  timedOut?: number
  total: number
  zephyrCycleUrl?: string
}

export interface AggregatedResults {
  failed: number
  flaky: number
  passed: number
  skipped: number
  testCases: TestCase[]
  timedOut: number
  total: number
}

export interface AdaptiveCardTextBlock {
  color?: string
  isSubtle?: boolean
  separator?: boolean
  size?: string
  spacing?: string
  text: string
  type: "TextBlock"
  weight?: string
  wrap?: boolean
}

export interface AdaptiveCardColumn {
  items: AdaptiveCardTextBlock[]
  type: "Column"
  width: string
}

export interface AdaptiveCardColumnSet {
  columns: AdaptiveCardColumn[]
  spacing?: string
  type: "ColumnSet"
}

export type AdaptiveCardBody = AdaptiveCardTextBlock | AdaptiveCardColumnSet

export interface AdaptiveCard {
  $schema: string
  actions?: AdaptiveCardAction[]
  body: AdaptiveCardBody[]
  type: "AdaptiveCard"
  version: string
}

export interface AdaptiveCardOpenUrlAction {
  title: string
  type: "Action.OpenUrl"
  url: string
}

export interface AdaptiveCardShowCardAction {
  card: AdaptiveCard
  title: string
  type: "Action.ShowCard"
}

export type AdaptiveCardAction =
  | AdaptiveCardOpenUrlAction
  | AdaptiveCardShowCardAction

export interface TeamsMessagePayload {
  attachments: Array<{
    content: AdaptiveCard
    contentType: "application/vnd.microsoft.card.adaptive"
  }>
  summary: string
  type: "message"
}

export interface TeamsReporterOptions {
  enabled?: boolean
  environment?: string
  includeTestCases?: boolean
  maxTestCases?: number
  reportUrl?: string
  testCycleId?: string
  webhookUrl?: string
  zephyrCycleUrl?: string
}

export interface WebhookLogger {
  error(message: string): void
  warn(message: string): void
}

export interface SendToTeamsOptions {
  fetchFn?: typeof fetch
  logger?: WebhookLogger
  maxRetries?: number
  retryDelayMs?: number
}

export interface SendToTeamsResult {
  attempts: number
  delivered: boolean
  errorMessage?: string
  responseBody?: string
  statusCode?: number
}
