/**
 * ui-layout runs its suite under TWO renderers.
 *
 * The web project is the package's original harness, unchanged — every pre-existing
 * `*.test.tsx` still runs there and only there. The native project is additive and matches
 * ONLY `*.native.test.tsx`, which is what makes this retrofit safe: no existing test file
 * was renamed, re-scoped, or asked to pass under a renderer it was never written for.
 *
 * Why bother: under a single renderer, a component that correctly threads its accessibility
 * hint and one that silently drops it are indistinguishable — that is precisely how the
 * `accessibilityHint` bug survived for years across the fleet. ModalDropdown now delegates
 * that threading to `@dloizides/a11y`, and the native project is what proves the delegation
 * emits genuinely different props per platform rather than the same props twice.
 *
 *   project   `react-native` resolves to   Platform.OS   matches
 *   -------   --------------------------   -----------   --------------------
 *   web       react-native-web             'web'         *.test.ts(x)
 *   native    react-native (the REAL one)  'ios'         *.native.test.tsx
 */

const common = {
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.d.ts', '!src/**/index.ts'],
};

/** WEB — the original harness. This is what all 7 portals actually ship today. */
const webProject = {
  ...common,
  displayName: 'web',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['\\.native\\.test\\.tsx?$'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};

/**
 * NATIVE — the REAL react-native, via its own Jest preset. Note the deliberate ABSENCE of a
 * `react-native` moduleNameMapper: adding one would quietly collapse this project into a
 * second copy of the web project, which is the exact failure mode the gate exists to prevent.
 */
const nativeProject = {
  ...common,
  displayName: 'native',
  preset: 'react-native',
  testMatch: ['**/*.native.test.tsx'],
};

/** @type {import('jest').Config} */
module.exports = {
  projects: [webProject, nativeProject],
  coverageReporters: ['text', 'lcov', 'html'],
};
