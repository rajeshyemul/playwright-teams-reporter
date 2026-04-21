import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase as PlaywrightTestCase,
  TestResult
} from "@playwright/test/reporter"

import { buildAdaptiveCard } from "./cardBuilder"
import { buildOverallSummary, collectResultsFromSuite } from "./results"
import { resolveConfig, validateConfig } from "../utils/config"
import { formatDate, formatDuration } from "../utils/format"
import { sendToTeams } from "../utils/webhook"

import type { ResultData, TeamsReporterOptions } from "../types"

export class TeamsReporter implements Reporter {
  private readonly config: Required<TeamsReporterOptions>
  private hasExecutedTests = false
  private rootSuite: Suite | null = null

  constructor(options: TeamsReporterOptions = {}) {
    this.config = resolveConfig(options)
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    if (!this.config.enabled) return
    this.rootSuite = suite
  }

  onTestEnd(_test: PlaywrightTestCase, _result: TestResult): void {
    if (!this.config.enabled) return
    this.hasExecutedTests = true
  }

  async onEnd(result: FullResult): Promise<void> {
    if (!this.config.enabled) {
      console.log("[playwright-teams-reporter] Reporter is disabled. Set TEAMS_REPORTER_ENABLED=true to enable.")
      return
    }

    try {
      validateConfig(this.config)
    } catch (error) {
      console.error((error as Error).message)
      return
    }

    if (!this.hasExecutedTests) {
      console.log("[playwright-teams-reporter] No executed tests were detected. Skipping Teams notification.")
      return
    }

    const aggregated = collectResultsFromSuite(this.rootSuite)
    const summary = buildOverallSummary(result.status, aggregated)

    const resultData: ResultData = {
      date: formatDate(result.startTime),
      duration: formatDuration(result.duration),
      environment: this.config.environment,
      failed: aggregated.failed,
      flaky: aggregated.flaky,
      reportUrl: this.config.reportUrl || undefined,
      skip: aggregated.skipped,
      success: aggregated.passed,
      summary,
      testCases: aggregated.testCases,
      testCycleId: this.config.testCycleId || undefined,
      timedOut: aggregated.timedOut,
      total: aggregated.total,
      zephyrCycleUrl: this.config.zephyrCycleUrl || undefined
    }

    const payload = buildAdaptiveCard(
      resultData,
      this.config.includeTestCases,
      this.config.maxTestCases
    )

    console.log("[playwright-teams-reporter] Sending results to MS Teams...")

    const sendResult = await sendToTeams(this.config.webhookUrl, payload)

    if (sendResult.delivered) {
      console.log("[playwright-teams-reporter] Done.")
      return
    }

    console.warn("[playwright-teams-reporter] Message was not delivered to Teams.")
  }

  printsToStdio(): boolean {
    return false
  }
}

export default TeamsReporter
