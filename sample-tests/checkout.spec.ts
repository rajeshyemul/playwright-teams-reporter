import { expect, test } from "@playwright/test"

test.describe("Checkout", () => {
  test("calculates cart totals correctly", async () => {
    const lineItems = [
      { name: "Room booking", price: 199 },
      { name: "Breakfast", price: 29 },
      { name: "Parking", price: 15 }
    ]

    const total = lineItems.reduce((sum, item) => sum + item.price, 0)

    expect(total).toBe(243)
  })

  test("marks unsupported coupon scenarios as skipped", async () => {
    test.skip(true, "Coupon rules are not available in this demo suite.")

    expect(true).toBe(false)
  })
})
