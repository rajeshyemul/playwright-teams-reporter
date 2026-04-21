import { expect, test } from "@playwright/test"

import { resolveConfig, validateConfig } from "../src/utils/config"

test.describe("resolveConfig", () => {
  test("keeps reporter disabled by default", () => {
    const config = resolveConfig({}, {})

    expect(config.enabled).toBe(false)
    expect(config.includeTestCases).toBe(true)
    expect(config.maxTestCases).toBe(50)
    expect(config.environment).toBe("Unknown")
  })

  test("prefers explicit options over environment values", () => {
    const config = resolveConfig(
      {
        enabled: false,
        environment: "qa",
        includeTestCases: false,
        maxTestCases: 10,
        webhookUrl: "https://override.example.com"
      },
      {
        TEAMS_REPORTER_ENABLED: "true",
        TEAMS_ENVIRONMENT: "prod",
        TEAMS_INCLUDE_TEST_CASES: "true",
        TEAMS_MAX_TEST_CASES: "100",
        TEAMS_WEBHOOK_URL: "https://env.example.com"
      }
    )

    expect(config.enabled).toBe(false)
    expect(config.environment).toBe("qa")
    expect(config.includeTestCases).toBe(false)
    expect(config.maxTestCases).toBe(10)
    expect(config.webhookUrl).toBe("https://override.example.com")
  })

  test("supports legacy environment aliases", () => {
    const config = resolveConfig(
      {},
      {
        MSTEAMS_REPORT_ENABLED: "true",
        MSTEAMS_WEBHOOK_URL: "https://legacy.example.com",
        TEST_ENV: "local"
      }
    )

    expect(config.enabled).toBe(true)
    expect(config.webhookUrl).toBe("https://legacy.example.com")
    expect(config.environment).toBe("local")
  })

  test("validates enabled configuration", () => {
    expect(() =>
      validateConfig({
        enabled: true,
        environment: "qa",
        includeTestCases: true,
        maxTestCases: 50,
        reportUrl: "",
        testCycleId: "",
        webhookUrl: "",
        zephyrCycleUrl: ""
      })
    ).toThrow("Webhook URL is required")
  })
})
