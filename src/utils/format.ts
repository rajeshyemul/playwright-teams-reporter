/**
 * Converts milliseconds to a human-readable duration string.
 * e.g. 125300 → "2m 5s"
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (minutes === 0) return `${seconds}s`
  return `${minutes}m ${seconds}s`
}

/**
 * Formats a Date to a readable string: "14 Apr 2026, 10:30 AM"
 */
export function formatDate(date: Date = new Date()): string {
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  })
}
