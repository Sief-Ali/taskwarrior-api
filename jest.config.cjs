module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.test.cjs"],
  transform: {
    "^.+\\.tsx?$": "<rootDir>/test/transformer.cjs",
  },
};
