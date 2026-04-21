# playwright-teams-reporter

Send Playwright test execution summaries to Microsoft Teams via Adaptive Cards.

## Installation

```bash
npm install -D playwright-teams-reporter
```

## Quick Start

1. Create a Teams incoming webhook.
2. Add your webhook details to `.env`.
3. Register the reporter in `playwright.config.ts`.

Example `.env`:

```env
TEAMS_REPORTER_ENABLED=true
TEAMS_WEBHOOK_URL=https://your-org.webhook.office.com/webhookb2/...
TEAMS_ENVIRONMENT=staging
TEAMS_TEST_CYCLE_ID=QA-2026-Q2
TEAMS_REPORT_URL=https://your-ci.example.com/reports/latest
TEAMS_ZEPHYR_CYCLE_URL=https://jira.example.com/cycles/123
TEAMS_INCLUDE_TEST_CASES=true
TEAMS_MAX_TEST_CASES=50
```

Example `playwright.config.ts`:

```ts
import dotenv from "dotenv"
import { defineConfig } from "@playwright/test"

dotenv.config()

export default defineConfig({
  reporter: [
    ["list"],
    [
      "playwright-teams-reporter",
      {
        environment: "staging"
      }
    ]
  ]
})
```

Programmatic options always win over env vars. The reporter is off by default unless explicitly enabled.

## What The Card Shows

- pass/fail colored summary header
- environment, date, execution time, pass rate
- total, passed, failed, skipped, flaky, timed out counts
- optional report and Zephyr links
- detailed test rows sorted by severity
- inline failure snippets and retry counts

## Configuration

| Option | Env Var | Default | Description |
|---|---|---|---|
| `enabled` | `TEAMS_REPORTER_ENABLED` | `false` | Master on/off switch |
| `webhookUrl` | `TEAMS_WEBHOOK_URL` | — | Teams incoming webhook URL |
| `environment` | `TEAMS_ENVIRONMENT` | `"Unknown"` | Environment label on the card |
| `reportUrl` | `TEAMS_REPORT_URL` | — | Link to an external report |
| `zephyrCycleUrl` | `TEAMS_ZEPHYR_CYCLE_URL` | — | Link to a Zephyr cycle |
| `testCycleId` | `TEAMS_TEST_CYCLE_ID` | — | Test cycle label |
| `includeTestCases` | `TEAMS_INCLUDE_TEST_CASES` | `true` | Include detailed test rows |
| `maxTestCases` | `TEAMS_MAX_TEST_CASES` | `50` | Cap rows to stay within Teams payload limits |

Legacy aliases are also supported: `MSTEAMS_REPORT_ENABLED`, `MSTEAMS_WEBHOOK_URL`, and `TEST_ENV`.

## Behavior

- webhook failures never fail the Playwright run
- transient webhook failures are retried twice with a 2 second delay
- timed out tests are counted separately and included in the summary
- flaky tests are detected from Playwright final outcomes
- detail rows are trimmed using `maxTestCases`
- discovery-only runs do not post to Teams

## Standalone Card Builder

```ts
import { buildAdaptiveCard } from "playwright-teams-reporter"

const payload = buildAdaptiveCard({
  date: "20 Apr 2026, 03:30 PM",
  duration: "2m 15s",
  environment: "staging",
  failed: 1,
  skip: 0,
  success: 9,
  summary: "⚠️ Run completed with failures",
  testCases: [],
  total: 10
})
```

## Local Verification

Package checks:

```bash
npm run typecheck
npm test
npm run build
```

Combined check:

```bash
npm run check
```

Real sample suite that posts to Teams using `.env`:

```bash
npm run test:teams
```

Generate the checked-in sample payload:

```bash
npm run example:payload
```

That writes:

```text
examples/output/sample-teams-payload.json
```

## Publishing Notes

- `prepublishOnly` runs typecheck, tests, and build
- package contents are limited through the `files` field
- current `publishConfig.access` is `public`

## License

MIT
