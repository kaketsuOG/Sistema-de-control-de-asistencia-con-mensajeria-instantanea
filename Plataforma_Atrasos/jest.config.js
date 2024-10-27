// jest.config.js
module.exports = {
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/frontend/src/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.js'],
      moduleNameMapper: {
        // Mock para archivos de estilo
        '\\.(css|less|scss)$': 'identity-obj-proxy',
        // Mock para archivos de imagen
        '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': '<rootDir>/__mocks__/fileMock.js'
      },
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      },
      transformIgnorePatterns: [
        '/node_modules/',
        '\\.(jpg|jpeg|png|gif|webp|svg|ico)$'
      ]
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/backend/src/**/*.test.js'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
      }
    }
  ]
};