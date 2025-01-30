export default {
    testEnvironment: 'jest-environment-jsdom',
    transform: {
      "^.+\\.jsx?$": "babel-jest"
    },
    moduleNameMapper: {
      "\\.(css|less|sass|scss)$": "identity-obj-proxy",
      "\\.(gif|jpg|jpeg|png|svg)$": "jest-transform-stub"
    }
  };
  