import { expect, test } from "@playwright/test"

import { sendToTeams } from "../src/utils/webhook"
import { createExamplePayload } from "./fixtures/exampleResult"

test.describe("sendToTeams", () => {
  test("posts the payload through fetch with the expected request body", async () => {
    const payload = createExamplePayload()
    const capturedRequests: Array<{ body?: string; url: string }> = []

    const result = await sendToTeams("https://example.test/teams", payload, {
      fetchFn: async (url, init) => {
        capturedRequests.push({
          body: init?.body?.toString(),
          url: String(url)
        })

        return new Response("1", { status: 200 })
      }
    })

    expect(result.delivered).toBe(true)
    expect(result.attempts).toBe(1)
    expect(capturedRequests).toHaveLength(1)
    expect(capturedRequests[0].url).toBe("https://example.test/teams")
    expect(JSON.parse(capturedRequests[0].body ?? "{}")).toEqual(payload)
  })

  test("retries transient failures and returns a success result", async () => {
    const payload = createExamplePayload()
    const calls: number[] = []
    const logs: string[] = []

    const result = await sendToTeams("https://example.test/teams", payload, {
      fetchFn: async () => {
        calls.push(Date.now())

        if (calls.length < 3) {
          return new Response("temporary outage", { status: 503 })
        }

        return new Response("1", { status: 200 })
      },
      logger: {
        error: (message) => logs.push(`error:${message}`),
        warn: (message) => logs.push(`warn:${message}`)
      },
      retryDelayMs: 0
    })

    expect(result.delivered).toBe(true)
    expect(result.attempts).toBe(3)
    expect(calls).toHaveLength(3)
    expect(logs.filter((entry) => entry.startsWith("warn:"))).toHaveLength(2)
  })

  test("does not retry non-transient failures", async () => {
    const payload = createExamplePayload()
    const logs: string[] = []
    let calls = 0

    const result = await sendToTeams("https://example.test/teams", payload, {
      fetchFn: async () => {
        calls += 1
        return new Response("bad request", { status: 400 })
      },
      logger: {
        error: (message) => logs.push(`error:${message}`),
        warn: (message) => logs.push(`warn:${message}`)
      },
      retryDelayMs: 0
    })

    expect(result.delivered).toBe(false)
    expect(calls).toBe(1)
    expect(logs.filter((entry) => entry.startsWith("warn:"))).toHaveLength(0)
    expect(logs.filter((entry) => entry.startsWith("error:"))).toHaveLength(1)
  })
})
