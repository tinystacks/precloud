// eslint-disable-next-line
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['.d.ts', '.js'],
    verbose: true,
    coverageThreshold: {
      global: {
        branches: 75,
        functions: 89,
        lines: 92,
        statements: 92
    }
  }
  };