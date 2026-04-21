import { expect, test } from "@playwright/test"
import type {
  FullResult,
  Suite,
  TestCase as PlaywrightTestCase,
  TestResult
} from "@playwright/test/reporter"

import { TeamsReporter } from "../src/core/TeamsReporter"
import { buildOverallSummary, collectResultsFromSuite } from "../src/core/results"

function createTestResult(partial: Partial<TestResult>): TestResult {
  return {
    annotations: [],
    attachments: [],
    duration: 0,
    errors: [],
    parallelIndex: 0,
    retry: 0,
    startTime: new Date("2026-04-20T10:00:00.000Z"),
    status: "passed",
    stderr: [],
    stdout: [],
    steps: [],
    workerIndex: 0,
    ...partial
  }
}

function createTestCase(
  titlePath: string[],
  outcome: ReturnType<PlaywrightTestCase["outcome"]>,
  results: TestResult[],
  tags: string[] = []
): PlaywrightTestCase {
  return {
    annotations: [],
    expectedStatus: "passed",
    id: titlePath.join("-"),
    location: { column: 1, file: "tests/example.spec.ts", line: 1 },
    ok: () => outcome !== "unexpected",
    outcome: () => outcome,
    parent: {} as Suite,
    repeatEachIndex: 0,
    results,
    retries: results.length - 1,
    tags,
    timeout: 30_000,
    title: titlePath.at(-1) ?? "unknown",
    titlePath: () => ["", "chromium", ...titlePath],
    type: "test"
  }
}

function createSuite(tests: PlaywrightTestCase[]): Suite {
  return {
    allTests: () => tests,
    entries: () => tests,
    location: undefined,
    parent: undefined,
    project: () => undefined,
    suites: [],
    tests,
    title: "",
    titlePath: () => [""],
    type: "root"
  }
}

test.describe("reporter result aggregation", () => {
  test("collects final results instead of counting retries as separate tests", () => {
    const suite = createSuite([
      createTestCase(
        ["auth.spec.ts", "Login", "logs in"],
        "flaky",
        [
          createTestResult({
            duration: 1800,
            errors: [{ message: "temporary failure" }],
            retry: 0,
            status: "failed"
          }),
          createTestResult({
            duration: 900,
            retry: 1,
            status: "passed"
          })
        ],
        ["@smoke"]
      ),
      createTestCase(
        ["checkout.spec.ts", "Checkout", "submits order"],
        "unexpected",
        [
          createTestResult({
            duration: 2400,
            errors: [{ message: "order submission failed\nserver error" }],
            retry: 0,
            status: "failed"
          })
        ]
      ),
      createTestCase(
        ["search.spec.ts", "Search", "filters by price"],
        "skipped",
        [
          createTestResult({
            duration: 0,
            retry: 0,
            status: "skipped"
          })
        ]
      )
    ])

    const aggregated = collectResultsFromSuite(suite)

    expect(aggregated.total).toBe(3)
    expect(aggregated.passed).toBe(1)
    expect(aggregated.flaky).toBe(1)
    expect(aggregated.failed).toBe(1)
    expect(aggregated.skipped).toBe(1)
    expect(aggregated.testCases[0].status).toBe("FLAKY")
    expect(aggregated.testCases[1].failureMessage).toContain("order submission failed")
  })

  test("derives the overall summary from run status and aggregated data", () => {
    expect(
      buildOverallSummary("passed", {
        failed: 0,
        flaky: 0,
        passed: 2,
        skipped: 0,
        testCases: [],
        timedOut: 0,
        total: 2
      })
    ).toBe("✅ All tests passed")

    expect(
      buildOverallSummary("timedout", {
        failed: 1,
        flaky: 0,
        passed: 1,
        skipped: 0,
        testCases: [],
        timedOut: 1,
        total: 2
      })
    ).toBe("⏱️ Run timed out")
  })

  test("uses a quiet reporter mode so Playwright can keep its normal output", () => {
    const reporter = new TeamsReporter()

    expect(reporter.printsToStdio()).toBe(false)
  })

  test("does not treat a discovery-only run as a notification-worthy execution", async () => {
    const reporter = new TeamsReporter({
      enabled: true,
      environment: "local",
      webhookUrl: "https://example.test/webhook"
    })

    const logs: string[] = []
    const originalLog = console.log

    console.log = (message?: unknown) => {
      logs.push(String(message))
    }

    try {
      reporter.onBegin({} as never, createSuite([]))
      await reporter.onEnd({
        duration: 10,
        startTime: new Date("2026-04-20T10:00:00.000Z"),
        status: "passed"
      } satisfies FullResult)
    } finally {
      console.log = originalLog
    }

    expect(logs).toContain(
      "[playwright-teams-reporter] No executed tests were detected. Skipping Teams notification."
    )
  })
})
