module.exports = {
  env: {
    node: true,
  },
  extends: ['@evanpurkhiser/eslint-config/common'],
  rules: {
    'prettier/prettier': 'off',
    'simple-import-sort/imports': 'off',
    'simple-import-sort/exports': 'off',
  },
};
