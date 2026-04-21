import { buildMoreDetailsCard } from "./moreBuilder"

import type {
  AdaptiveCardAction,
  AdaptiveCardBody,
  AdaptiveCardColumn,
  AdaptiveCardTextBlock,
  TeamsMessagePayload,
  ResultData
} from "../types"

export function buildAdaptiveCard(
  resultData: ResultData,
  includeTestCases = true,
  maxTestCases = 50
): TeamsMessagePayload {
  const actions: AdaptiveCardAction[] = []

  if (resultData.zephyrCycleUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "📋 View Zephyr Cycle",
      url: resultData.zephyrCycleUrl
    })
  }

  if (resultData.reportUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "📊 View Report",
      url: resultData.reportUrl
    })
  }

  if (includeTestCases && resultData.testCases.length > 0) {
    actions.push(buildMoreDetailsCard(resultData.testCases.slice(0, maxTestCases)))
  }

  const passRate =
    resultData.total > 0
      ? ((resultData.success / resultData.total) * 100).toFixed(1)
      : "0.0"

  const overallPassed = resultData.failed === 0 && resultData.total > 0

  const body: AdaptiveCardBody[] = [
    {
      color: overallPassed ? "Good" : "Attention",
      size: "Large",
      spacing: "Medium",
      text: "🧪 Test Execution Summary",
      type: "TextBlock",
      weight: "Bolder",
      wrap: true
    },
    {
      spacing: "Small",
      text: `Environment: **${resultData.environment}**`,
      type: "TextBlock",
      wrap: true
    },
    ...(resultData.testCycleId
      ? [
          {
            spacing: "None",
            text: `Test Cycle: ${resultData.testCycleId}`,
            type: "TextBlock" as const,
            wrap: true
          }
        ]
      : []),
    {
      isSubtle: true,
      spacing: "None",
      text: `Date: ${resultData.date}`,
      type: "TextBlock",
      wrap: true
    },
    {
      isSubtle: true,
      spacing: "None",
      text: `Execution Time: ${resultData.duration}`,
      type: "TextBlock",
      wrap: true
    },
    ...(resultData.estimatedTime
      ? [
          {
            isSubtle: true,
            spacing: "None",
            text: `Estimated Time: ${resultData.estimatedTime}`,
            type: "TextBlock" as const,
            wrap: true
          }
        ]
      : []),
    {
      separator: true,
      spacing: "Medium",
      text: resultData.summary,
      type: "TextBlock",
      wrap: true
    },
    {
      color: overallPassed ? "Good" : "Attention",
      spacing: "Small",
      text: `Pass Rate: **${passRate}%**`,
      type: "TextBlock",
      wrap: true
    },
    {
      columns: buildStatColumns(resultData),
      spacing: "Medium",
      type: "ColumnSet"
    }
  ]

  return {
    attachments: [
      {
        content: {
          $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
          actions,
          body,
          type: "AdaptiveCard",
          version: "1.5"
        },
        contentType: "application/vnd.microsoft.card.adaptive"
      }
    ],
    summary: `Test Execution Summary — ${resultData.environment} — ${resultData.date}`,
    type: "message"
  }
}

function buildStatColumns(resultData: ResultData) {
  const columns = [
    buildStatColumn("Total", String(resultData.total), "Default"),
    buildStatColumn("✅ Passed", String(resultData.success), "Good"),
    buildStatColumn("❌ Failed", String(resultData.failed), "Attention"),
    buildStatColumn("⏭️ Skipped", String(resultData.skip), "Warning")
  ]

  if (resultData.flaky && resultData.flaky > 0) {
    columns.push(buildStatColumn("⚠️ Flaky", String(resultData.flaky), "Warning"))
  }

  if (resultData.timedOut && resultData.timedOut > 0) {
    columns.push(buildStatColumn("⏱️ Timed Out", String(resultData.timedOut), "Attention"))
  }

  return columns
}

function buildStatColumn(
  label: string,
  value: string,
  color: string
): AdaptiveCardColumn {
  return {
    items: [
      createTextBlock(label, { weight: "Bolder", wrap: true }),
      createTextBlock(value, { color, size: "Large" })
    ],
    type: "Column",
    width: "stretch"
  }
}

function createTextBlock(
  text: string,
  overrides: Omit<AdaptiveCardTextBlock, "text" | "type"> = {}
): AdaptiveCardTextBlock {
  return {
    text,
    type: "TextBlock",
    ...overrides
  }
}
