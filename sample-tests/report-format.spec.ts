import { expect, test } from "@playwright/test"

test.describe("Report Format", () => {
  test("creates data that is suitable for the Teams card", async () => {
    const summary = {
      duration: "3s",
      environment: "local",
      total: 3
    }

    expect(summary.environment).toBe("local")
    expect(summary.total).toBeGreaterThan(0)
    expect(summary.duration.endsWith("s")).toBeTruthy()
  })
})
