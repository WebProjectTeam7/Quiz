const globals = require('globals');
const js = require('@eslint/js');
const jsdoc = require('eslint-plugin-jsdoc');

module.exports = {
    root: true,
    env: {
        browser: true,
        es2020: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    settings: {
        react: {
            version: '18.2',
        },
    },
    plugins: ['react-refresh', 'jsdoc'],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        'max-len': [
            'error',
            {
                code: 150,
                tabWidth: 4,
                ignoreComments: true,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
            },
        ],
        'no-console': ["error", { "allow": ["warn", "error"] }],
        'object-curly-spacing': ['error', 'always'],
        quotes: ['error', 'single'],
        'quote-props': 'off',
        complexity: ['error', 30],
        'consistent-return': 'error',
        'default-case': 'error',
        'dot-notation': 'error',
        eqeqeq: 'error',
        'func-style': ['error', 'expression'],
        'no-alert': 'error',
        'no-div-regex': 'error',
        'no-else-return': 'error',
        'no-labels': 'error',
        'no-eq-null': 'error',
        'no-eval': 'error',
        'no-floating-decimal': 'error',
        'no-implied-eval': 'error',
        'no-iterator': 'error',
        'no-lone-blocks': 'error',
        'no-loop-func': 'error',
        'no-new': 'error',
        'no-new-func': 'error',
        'no-proto': 'error',
        'no-return-assign': 'error',
        'no-script-url': 'error',
        'no-self-compare': 'error',
        'no-sequences': 'error',
        'no-unused-expressions': 'error',
        'no-undef-init': 'error',
        'no-undefined': 'error',
        'no-unused-vars': 'warn',
        indent: ['error', 4, { SwitchCase: 1 }],
        'keyword-spacing': ['error', { before: true, after: true }],
        'space-before-blocks': ['error', 'always'],
        // 'space-before-function-paren': ['error', 'never'], // Uncomment if needed
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': ['error', { int32Hint: false }],
        'space-unary-ops': ['error', { words: true, nonwords: false }],
        'spaced-comment': ['error', 'always', { exceptions: ['-', '+'] }],
        semi: ['error', 'always'],
        'no-trailing-spaces': ['error'],
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'block-like' },
            { blankLine: 'always', prev: 'block-like', next: '*' },
            { blankLine: 'always', prev: 'block-like', next: 'block-like' },
            { blankLine: 'always', prev: '*', next: 'return' },
            { blankLine: 'any', prev: '*', next: '*' },
        ],
        'no-multiple-empty-lines': [
            'error',
            { max: 2, maxEOF: 1, maxBOF: 1 },
        ],
    },
    overrides: [
        {
            files: ['**/*.js'],
            parserOptions: {
                ecmaVersion: 13,
                sourceType: 'module',
            },
            env: {
                node: true,
            },
            globals: globals.node,
            plugins: ['jsdoc'],
            rules: {
                ...js.configs.recommended.rules,
                ...jsdoc.configs.recommended.rules,
            },
        },
    ],
};
