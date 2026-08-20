module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/src/__mocks__/setup-tests.js'
  ],
  moduleNameMapper: {
    '^react-native/setup-env$': '<rootDir>/__mocks__/setup-env.js',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  },
  clearMocks: true,
};
