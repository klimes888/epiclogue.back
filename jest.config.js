module.exports = {
  // Env settings
  testEnvironment: "node",
  preset: "@shelf/jest-mongodb",
  verbose: true,
  // Ignoring directories
  modulePathIgnorePatterns: [
    /* default ignorance */
    "./__tests__/configs/*",
    "./__tests__/ignore/*",

    /* server healthChecking (for proper runtime checking) */
    "./__tests__/integration/v1/healthCheck.test.js",

    /* middleswares */
    "./__tests__/middlewares/v1/token.test.js",

    /* integration */
    "./__tests__/integration/v1/user.test.js",
    // "./__tests__/integration/v1/board.test.js",
    // "./__tests__/integration/v1/feedback.test.js",
    // "./__tests__/integration/v1/reply.test.js",

    /* interactions */
    // "./__tests__/interactions/v1/follow.test.js",
    // "./__tests__/interactions/v1/like.test.js",
    // "./__tests__/interactions/v1/bookmark.test.js",
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