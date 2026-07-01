module.exports = {
  testEnvironment: "jsdom",

  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],

  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
  },

  moduleNameMapper: {
    "\\.(css|scss|sass|less)$": "identity-obj-proxy",
  },

  moduleFileExtensions: [
    "ts",
    "tsx",
    "js",
    "jsx",
    "json",
  ],

  testMatch: [
    "**/__tests__/**/*.test.(ts|tsx)",
    "**/?(*.)+(test).(ts|tsx)",
  ],
};