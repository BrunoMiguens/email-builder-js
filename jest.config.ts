import type { Config } from 'jest';

// sanitize-html (>=2.17.2) pulls an ESM-only htmlparser2, which Jest will not load
// from node_modules without transforming it first. Transform that dependency subtree
// rather than pinning sanitize-html below the bump — pinning a sanitizer to an old
// release to satisfy test tooling would block future security patches.
const ESM_DEPENDENCIES = [
  'sanitize-html',
  'htmlparser2',
  'domhandler',
  'domutils',
  'domelementtype',
  'dom-serializer',
  'entities',
];

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: { allowJs: true } }],
  },
  transformIgnorePatterns: [`node_modules/(?!(${ESM_DEPENDENCIES.join('|')})/)`],
};

export default config;
