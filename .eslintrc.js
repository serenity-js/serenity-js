module.exports = {
    root: true,
    ignorePatterns: [ '**/lib/**' ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module',
        project: [
            './examples/*/tsconfig.eslint.json',
            './integration/*/tsconfig.eslint.json',
            './packages/*/tsconfig.eslint.json',
        ],
    },
    plugins: [
        '@typescript-eslint',
        'simple-import-sort',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:unicorn/recommended',
    ],
    rules: {
        // 'simple-import-sort/imports': 'error',

        'no-multiple-empty-lines': ['warn', {
            'max': 1,
        }],

        'indent': 'off',
        '@typescript-eslint/indent': ['error', 4, {
            'MemberExpression': 'off',
            'SwitchCase': 1,
        }],

        'quotes': 'off',
        '@typescript-eslint/quotes': ['error', 'single', {
            'allowTemplateLiterals': true,
            'avoidEscape': true,
        }],

        '@typescript-eslint/no-explicit-any': 'off', // todo: review

        '@typescript-eslint/no-unused-vars': ['warn', {
            'args': 'none',
            'vars': 'all',
            'varsIgnorePattern': '^.*_$',
        }],

        'unicorn/empty-brace-spaces': 'off',

        'unicorn/filename-case': [ 'error', {
            'cases': {
                'kebabCase': true,      // packages
                'pascalCase': true,     // classes
                'camelCase': true,      // functions
            }
        }],

        'unicorn/no-array-for-each': 'off',
        'unicorn/no-array-reduce': 'off',
        'unicorn/no-array-callback-reference': 'off',
        'unicorn/no-static-only-class': 'off',

        'unicorn/numeric-separators-style': 'off',
        'unicorn/prefer-array-flat': 'off',     // todo: migrate to use @tsconfig/node12

        'unicorn/prefer-module': 'off',         // fixme disable when we can provide support for ESM
        'unicorn/prefer-node-protocol': 'off',  // fixme requires Node 14.13 or newer, disable until we no longer have to support Node 12
        'unicorn/prefer-spread': 'off',

        'unicorn/prevent-abbreviations': [ 'error', {
            'allowList': {
                'acc': true,
                'arg': true,
                'args': true,
                'attrs': true,
                'docString': true,
                'DocString': true,
                'e': true,
                'env': true,
                'fn': true,
                'fnAttrs': true,
                'i': true,
                'params': true,
                'pkg': true,
                'props': true,
            }
        }]
    }
};
