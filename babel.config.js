/**
 * Babel config for the NATIVE Jest project only.
 *
 * The `react-native` Jest preset transforms with babel-jest, and `@react-native/babel-preset`
 * is what teaches it Flow-typed RN internals, JSX and TypeScript. The web project does not use
 * Babel at all (it runs on ts-jest), and tsup builds with esbuild — so this file is read by
 * exactly one consumer, which is why it can be this small.
 */
module.exports = {
  presets: ['@react-native/babel-preset'],
};
