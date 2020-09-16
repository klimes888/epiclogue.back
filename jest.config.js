module.exports = {
  // Env settings
  testEnvironment: "node",
  preset: "@shelf/jest-mongodb",

  // Ignoring directories
  modulePathIgnorePatterns: [
    "./__tests__/configs/*",
    "./__tests__/ignore/*",
    
    // strangely, feedback and reply test should contain another test,
    // I recommend containing token test, the lightest one...
    // "./__tests__/middlewares/v1/token.test.js",

    // "./__tests__/interactions/*",
    // "./__tests__/integration/v1/healthCheck.test.js",
    // "./__tests__/integration/v1/users.test.js",
    // "./__tests__/integration/v1/board.test.js",
    // "./__tests__/integration/v1/feedback.test.js",
  ],

  // Trigger before all test cases start
  globalSetup: "./__tests__/configs/globalSetup.js",
  setupFilesAfterEnv: ["./__tests__/configs/setTimeout.js"],

  // Trigger after all test cases start
  globalTeardown: "./__tests__/configs/globalTeardown.js",

  // global variables
  globals: {
    
  }
}; 