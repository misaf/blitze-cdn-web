import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      'import/no-anonymous-default-export': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'control-plane/**',
    'public/_pagefind/**',
    'playwright-report/**',
    'test-results/**',
  ]),
])
