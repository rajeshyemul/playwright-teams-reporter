export { TeamsReporter, TeamsReporter as default } from "./src/core/TeamsReporter"
export { buildAdaptiveCard } from "./src/core/cardBuilder"
export { buildMoreDetailsCard } from "./src/core/moreBuilder"
export { buildOverallSummary, collectResultsFromSuite } from "./src/core/results"

export type {
  AdaptiveCardAction,
  AggregatedResults,
  ResultData,
  SendToTeamsOptions,
  SendToTeamsResult,
  TeamsMessagePayload,
  TeamsReporterOptions,
  TestCase
} from "./src/types"

export { StatusEmoji, TestStatus } from "./src/types"
