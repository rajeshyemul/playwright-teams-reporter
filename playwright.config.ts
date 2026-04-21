import dotenv from "dotenv"
import { defineConfig } from "@playwright/test"

dotenv.config()

export default defineConfig({
  fullyParallel: false,
  retries: 0,
  testDir: "./sample-tests",
  testMatch: /.*\.spec\.ts$/,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    [
      "./src/index.ts",
      {
        environment: process.env.TEAMS_ENVIRONMENT ?? process.env.TEST_ENV ?? "local",
        includeTestCases: true,
        maxTestCases: 50
      }
    ]
  ],
  workers: 1
})
