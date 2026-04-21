export { TeamsReporter, TeamsReporter as default } from "./core/TeamsReporter"
export { buildAdaptiveCard } from "./core/cardBuilder"
export { buildMoreDetailsCard } from "./core/moreBuilder"
export { buildOverallSummary, collectResultsFromSuite } from "./core/results"

export type {
  AdaptiveCardAction,
  AggregatedResults,
  ResultData,
  SendToTeamsOptions,
  SendToTeamsResult,
  TeamsMessagePayload,
  TeamsReporterOptions,
  TestCase
} from "./types"

export { StatusEmoji, TestStatus } from "./types"
