module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  env: {
    node: true,
    jest: true,
  },
  plugins: ['@typescript-eslint', 'import', 'unused-imports'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['dist/', 'node_modules/'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
      alias: {
        map: [
          ['@ds-api', './src'],
          ['@ds-common', './src/common'],
          ['@ds-types', './src/common/types'],
          ['@ds-services', './src/common/services'],
        ],
        extensions: ['.ts', '.js', '.json'],
      },
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'import/order': ['warn', { 'newlines-between': 'always' }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'off',
  },
};
