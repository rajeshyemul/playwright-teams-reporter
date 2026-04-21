import { defineConfig } from "@playwright/test"

export default defineConfig({
  fullyParallel: false,
  reporter: [["list"]],
  testDir: "./tests",
  testMatch: /.*\.spec\.ts$/,
  workers: 1
})
