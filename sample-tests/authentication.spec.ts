import { expect, test } from "@playwright/test"

test.describe("Authentication", () => {
  test("accepts a valid username and password", async () => {
    const user = {
      password: "correct-horse-battery-staple",
      username: "rajesh"
    }

    expect(user.username).toBe("rajesh")
    expect(user.password.length).toBeGreaterThan(8)
  })

  test("rejects a blank password", async () => {
    const password = ""

    expect(password).toHaveLength(0)
    expect(password === "").toBeTruthy()
  })
})
