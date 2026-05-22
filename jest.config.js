const nextJest = require('next/jest.js')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',

  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },

  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
}

module.exports = createJestConfig(customJestConfig)