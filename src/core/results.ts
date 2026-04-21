import type {
  FullResult,
  Suite,
  TestCase as PlaywrightTestCase,
  TestResult
} from "@playwright/test/reporter"

import { TestStatus } from "../types"

import type { AggregatedResults, TestStatusValue } from "../types"

export function collectResultsFromSuite(rootSuite: Suite | null): AggregatedResults {
  const aggregated: AggregatedResults = {
    failed: 0,
    flaky: 0,
    passed: 0,
    skipped: 0,
    testCases: [],
    timedOut: 0,
    total: 0
  }

  for (const test of rootSuite?.allTests() ?? []) {
    const finalResult = getFinalResult(test)
    if (!finalResult?.status) continue

    const testIsFlaky = test.outcome() === "flaky"
    aggregated.total += 1

    switch (finalResult.status) {
      case "passed":
        aggregated.passed += 1
        if (testIsFlaky) aggregated.flaky += 1
        break
      case "failed":
        aggregated.failed += 1
        break
      case "skipped":
        aggregated.skipped += 1
        break
      case "timedOut":
        aggregated.failed += 1
        aggregated.timedOut += 1
        break
      case "interrupted":
        aggregated.failed += 1
        break
      default:
        break
    }

    aggregated.testCases.push({
      failureMessage:
        finalResult.status === "passed" && !testIsFlaky
          ? undefined
          : formatFailureMessage(finalResult.errors?.[0]?.message),
      name: formatTestName(test),
      retries: finalResult.retry,
      status: normalizeStatus(finalResult.status, testIsFlaky),
      tags: test.tags,
      time: finalResult.duration / 1000
    })
  }

  return aggregated
}

export function buildOverallSummary(
  runStatus: FullResult["status"],
  aggregated: AggregatedResults
): string {
  if (aggregated.total === 0) {
    return "No tests were executed"
  }

  if (runStatus === "passed") {
    return aggregated.failed === 0
      ? "✅ All tests passed"
      : "⚠️ Run completed with failures"
  }

  if (runStatus === "timedout") {
    return "⏱️ Run timed out"
  }

  return "❌ Run failed"
}

function getFinalResult(test: PlaywrightTestCase): TestResult | undefined {
  return test.results.at(-1)
}

function formatFailureMessage(message?: string): string | undefined {
  if (!message) return undefined

  const normalized = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")

  return normalized ? normalized.slice(0, 200) : undefined
}

function formatTestName(test: PlaywrightTestCase): string {
  const titlePath = test.titlePath().filter(Boolean)
  const relevantSegments = titlePath.length > 2 ? titlePath.slice(2) : titlePath

  return relevantSegments.join(" › ")
}

function normalizeStatus(
  status: TestResult["status"],
  flaky: boolean
): TestStatusValue {
  if (flaky) return TestStatus.FLAKY

  switch (status) {
    case "passed":
      return TestStatus.PASSED
    case "failed":
      return TestStatus.FAILED
    case "skipped":
      return TestStatus.SKIPPED
    case "timedOut":
      return TestStatus.TIMEDOUT
    case "interrupted":
      return TestStatus.INTERRUPTED
  }
}
