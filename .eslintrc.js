module.exports = {
  extends: [
    'standard-with-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'prettier/standard'
  ],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/prop-types': 'off'
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['lib/**/*']
}
