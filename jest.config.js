// eslint-disable-next-line
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['.d.ts', '.js'],
    coveragePathIgnorePatterns: [
      'src/errors'
    ],
    verbose: true,
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 80,
        lines: 90,
        statements: 90
    }
  }
  };