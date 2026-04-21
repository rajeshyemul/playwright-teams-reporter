import { StatusEmoji } from "../types"

import type {
  AdaptiveCardAction,
  AdaptiveCardBody,
  AdaptiveCardTextBlock,
  TestCase
} from "../types"

const statusPriority: Record<string, number> = {
  FAILED: 0,
  INTERRUPTED: 1,
  TIMEDOUT: 2,
  FLAKY: 3,
  SKIPPED: 4,
  PASSED: 5
}

export function buildMoreDetailsCard(testCases: TestCase[]): AdaptiveCardAction {
  const sortedTestCases = [...testCases].sort(
    (left, right) =>
      (statusPriority[left.status] ?? Number.MAX_SAFE_INTEGER) -
      (statusPriority[right.status] ?? Number.MAX_SAFE_INTEGER)
  )

  const body: AdaptiveCardBody[] = [
    {
      separator: true,
      size: "Medium",
      text: "📋 Test Cases Details",
      type: "TextBlock",
      weight: "Bolder",
      wrap: true
    },
    {
      columns: [
        {
          items: [{ text: "Status", type: "TextBlock", weight: "Bolder" }],
          type: "Column",
          width: "auto"
        },
        {
          items: [{ text: "Test Name", type: "TextBlock", weight: "Bolder" }],
          type: "Column",
          width: "stretch"
        },
        {
          items: [{ text: "Time (s)", type: "TextBlock", weight: "Bolder" }],
          type: "Column",
          width: "auto"
        }
      ],
      type: "ColumnSet"
    }
  ]

  for (const testCase of sortedTestCases) {
    body.push({
      columns: [
        {
          items: [{ text: StatusEmoji[testCase.status], type: "TextBlock" }],
          type: "Column",
          width: "auto"
        },
        {
          items: buildNameItems(testCase),
          type: "Column",
          width: "stretch"
        },
        {
          items: [{ text: testCase.time.toFixed(2), type: "TextBlock" }],
          type: "Column",
          width: "auto"
        }
      ],
      type: "ColumnSet"
    })
  }

  return {
    card: {
      $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
      body,
      type: "AdaptiveCard",
      version: "1.5"
    },
    title: "🔎 Test Cases Details",
    type: "Action.ShowCard"
  }
}

function buildNameItems(testCase: TestCase): AdaptiveCardTextBlock[] {
  const items: AdaptiveCardTextBlock[] = [createTextBlock(testCase.name, { wrap: true })]

  if (testCase.failureMessage) {
    items.push(
      createTextBlock(testCase.failureMessage, {
        color: "Attention",
        isSubtle: true,
        size: "Small",
        wrap: true
      })
    )
  }

  if (testCase.retries && testCase.retries > 0) {
    items.push(
      createTextBlock(`↻ Retried ${testCase.retries}x`, {
        color: "Warning",
        isSubtle: true,
        size: "Small"
      })
    )
  }

  return items
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
