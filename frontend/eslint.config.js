import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      'no-undef': 'off', // Allow undefined globals like process, Buffer
      'react-hooks/exhaustive-deps': 'warn', // Make this a warning instead of error
    },
  },
  // Special config for API routes
  {
    files: ['pages/api/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node, // Add Node.js globals for API routes
        process: 'readonly',
        Buffer: 'readonly',
        console: 'readonly',
        require: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'off', // Allow unused vars in API routes
      'no-undef': 'off', // Allow Node.js globals
    },
  },
])
