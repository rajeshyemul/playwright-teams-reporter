import type { TeamsReporterOptions } from "../types"

export function resolveConfig(
  options: TeamsReporterOptions = {},
  env: NodeJS.ProcessEnv = process.env
): Required<TeamsReporterOptions> {
  const enabled =
    options.enabled ??
    parseBooleanEnv(env, "TEAMS_REPORTER_ENABLED", "MSTEAMS_REPORT_ENABLED") ??
    false

  const includeTestCases =
    options.includeTestCases ??
    parseBooleanEnv(env, "TEAMS_INCLUDE_TEST_CASES", "MSTEAMS_INCLUDE_TEST_CASES") ??
    true

  const maxTestCases =
    options.maxTestCases ??
    parseNumberEnv(env, "TEAMS_MAX_TEST_CASES", "MSTEAMS_MAX_TEST_CASES") ??
    50

  return {
    enabled,
    environment: (options.environment ?? firstEnv(env, "TEAMS_ENVIRONMENT", "MSTEAMS_ENVIRONMENT", "TEST_ENV") ?? "Unknown").trim(),
    includeTestCases,
    maxTestCases: maxTestCases > 0 ? maxTestCases : 50,
    reportUrl: (options.reportUrl ?? firstEnv(env, "TEAMS_REPORT_URL", "MSTEAMS_REPORT_URL") ?? "").trim(),
    testCycleId: (options.testCycleId ?? firstEnv(env, "TEAMS_TEST_CYCLE_ID", "MSTEAMS_TEST_CYCLE_ID") ?? "").trim(),
    webhookUrl: (options.webhookUrl ?? firstEnv(env, "TEAMS_WEBHOOK_URL", "MSTEAMS_WEBHOOK_URL") ?? "").trim(),
    zephyrCycleUrl: (options.zephyrCycleUrl ?? firstEnv(env, "TEAMS_ZEPHYR_CYCLE_URL", "MSTEAMS_ZEPHYR_CYCLE_URL") ?? "").trim()
  }
}

export function validateConfig(config: Required<TeamsReporterOptions>): void {
  if (!config.webhookUrl) {
    throw new Error(
      "[playwright-teams-reporter] Webhook URL is required when reporter is enabled.\n" +
      "Set TEAMS_WEBHOOK_URL in your .env file or pass webhookUrl in reporter options."
    )
  }

  if (!config.webhookUrl.startsWith("https://") && !config.webhookUrl.startsWith("http://")) {
    throw new Error("[playwright-teams-reporter] webhookUrl must be a valid HTTP(S) URL.")
  }

  if (!Number.isInteger(config.maxTestCases) || config.maxTestCases <= 0) {
    throw new Error("[playwright-teams-reporter] maxTestCases must be a positive integer.")
  }
}

function firstEnv(
  env: NodeJS.ProcessEnv,
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const value = env[name]
    if (value !== undefined && value !== "") {
      return value
    }
  }

  return undefined
}

function parseBooleanEnv(
  env: NodeJS.ProcessEnv,
  ...names: string[]
): boolean | undefined {
  const value = firstEnv(env, ...names)
  if (value === undefined) return undefined

  const normalized = value.trim().toLowerCase()

  if (["true", "1", "yes", "on"].includes(normalized)) return true
  if (["false", "0", "no", "off"].includes(normalized)) return false

  return undefined
}

function parseNumberEnv(
  env: NodeJS.ProcessEnv,
  ...names: string[]
): number | undefined {
  const value = firstEnv(env, ...names)
  if (value === undefined) return undefined

  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) ? parsed : undefined
}
