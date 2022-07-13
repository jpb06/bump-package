/** @type {import('@jest/types').Config.InitialOptions} */

module.exports = {
  logHeapUsage: true,
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', {}],
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname",
  ],
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/**/*.ts'],
  coveragePathIgnorePatterns: [
    ".d.ts",
    ".js",
    "<rootDir>/main.ts",
    "<rootDir>/tests-related/",
    "<rootDir>/types/",
  ],
  coverageDirectory: './../coverage',
  testEnvironment: 'node',
  coverageReporters: ['json-summary', 'text', 'lcov'],
};