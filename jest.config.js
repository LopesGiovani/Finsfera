const dotEnv = require("dotenv");

dotEnv.config({
  path: ".env.development",
});
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: ".",
});

const JestConfig = createJestConfig({
  moduleDirectories: ["node_modules", "<rootDir>"],
  testTimeout: 60000,
});

module.exports = JestConfig;
