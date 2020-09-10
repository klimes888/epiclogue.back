module.exports = {
  // Env settings
  testEnvironment: "node",
  preset: "@shelf/jest-mongodb",

  // Ignoring directories
  modulePathIgnorePatterns: [
    "./__tests__/configs/*",
    "./__tests__/interactions/*",
    "./__tests__/integration/v1/users.test.js",
    "./__tests__/integration/v1/auth.test.js",
  ],

  // Trigger before all test cases start
  globalSetup: "./__tests__/configs/globalSetup.js",
  setupFilesAfterEnv: ["./__tests__/configs/setTimeout.js"],

  // Trigger after all test cases start
  globalTeardown: "./__tests__/configs/globalTeardown.js",
}; 