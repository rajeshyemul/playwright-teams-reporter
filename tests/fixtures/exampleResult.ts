import { buildAdaptiveCard } from "../../src/core/cardBuilder"
import { TestStatus } from "../../src/types"

import type { ResultData, TeamsMessagePayload } from "../../src/types"

export function createExampleResultData(): ResultData {
  return {
    date: "20 Apr 2026, 03:30 PM",
    duration: "2m 15s",
    environment: "staging",
    failed: 1,
    flaky: 1,
    reportUrl: "https://ci.example.com/reports/latest",
    skip: 1,
    success: 2,
    summary: "⚠️ Run completed with failures",
    testCases: [
      {
        failureMessage: "Expected status code 200 but received 500 Internal Server Error",
        name: "checkout.spec.ts › Checkout › submits order",
        retries: 0,
        status: TestStatus.FAILED,
        time: 12.4
      },
      {
        name: "auth.spec.ts › Login › signs in valid user",
        retries: 1,
        status: TestStatus.FLAKY,
        time: 4.2
      },
      {
        name: "account.spec.ts › Profile › updates preferences",
        retries: 0,
        status: TestStatus.PASSED,
        time: 3.1
      },
      {
        name: "search.spec.ts › Filters › handles no results",
        retries: 0,
        status: TestStatus.SKIPPED,
        time: 0
      }
    ],
    testCycleId: "QA-2026-04",
    timedOut: 0,
    total: 4,
    zephyrCycleUrl: "https://jira.example.com/cycles/QA-2026-04"
  }
}

export function createExamplePayload(): TeamsMessagePayload {
  return buildAdaptiveCard(createExampleResultData(), true, 50)
}
