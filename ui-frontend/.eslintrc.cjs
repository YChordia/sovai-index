module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    // Modern JSX transform doesn't require React in scope
    'react/react-in-jsx-scope': 'off',
    'react/jsx-uses-react': 'off',
    // Using TypeScript types; no need for prop-types
    'react/prop-types': 'off',
    // Allow any temporarily; can tighten per-file later
    '@typescript-eslint/no-explicit-any': 'off',
    // Ignore unused underscored vars/args
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
  },
}
