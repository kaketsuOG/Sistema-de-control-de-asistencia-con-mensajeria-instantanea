module.exports = {
  projects: [
    {
      displayName: 'frontend',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/frontend/src/**/*.test.js'],
      setupFilesAfterEnv: ['./jest.setup.js'],
      moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg|ico)$': '<rootDir>/__mocks__/fileMock.js',
        '^whatsapp-web.js$': '<rootDir>/__mocks__/whatsapp-web.js',
        '^mysql2$': '<rootDir>/__mocks__/mysql2.js',
      },
      transform: {
        '^.+\\.jsx?$': 'babel-jest',
      },
      moduleDirectories: ['node_modules'], // Simplifica los imports
      coveragePathIgnorePatterns: ['/node_modules/', '/dist/'], // Ignorar ciertas carpetas
      transformIgnorePatterns: ['/node_modules/', '\\.(jpg|jpeg|png|gif|webp|svg|ico)$'],
    },
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/src/__tests__/**/*.test.js'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      setupFilesAfterEnv: ['./jest.setup.js'],
      moduleNameMapper: {
        '^mysql2$': '<rootDir>/__mocks__/mysql2.js',
        '^whatsapp-web.js$': '<rootDir>/__mocks__/whatsapp-web.js',
      },
      coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    }
  ],
};