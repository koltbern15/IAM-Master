import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/.next/',
      '**/.turbo/',
      '**/dist/',
      '.claude/worktrees/',
      '**/*.config.*'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  nextPlugin.configs['core-web-vitals'],
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'react/no-unescaped-entities': 'off',
      '@next/next/no-html-link-for-pages': 'off'
    }
  }
]
