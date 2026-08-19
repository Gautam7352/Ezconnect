module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  moduleNameMapper: {
    '^react-native/setup-env$': '<rootDir>/__mocks__/setup-env.js',
    '^test-renderer$': 'react-test-renderer',
    '^react-native-mmkv$': '<rootDir>/__mocks__/react-native-mmkv.js',
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  },
  clearMocks: true,
};
