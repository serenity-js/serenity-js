import stylisticPlugin from '@stylistic/eslint-plugin';
import eslintPluginMocha from 'eslint-plugin-mocha';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Global ignores (replaces .eslintignore)
    {
        ignores: [
            '**/node_modules/**',
            '**/esm/**',
            '**/lib/**',
            'integration/**/examples/**/*.js',
        ],
    },

    // Base configuration for all TypeScript files
    {
        files: ['**/*.ts', '**/*.tsx'],
        linterOptions: {
            reportUnusedDisableDirectives: 'warn',
        },
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            '@stylistic': stylisticPlugin,
            'mocha': eslintPluginMocha,
            'simple-import-sort': eslintPluginSimpleImportSort,
            'unused-imports': eslintPluginUnusedImports,
            'unicorn': eslintPluginUnicorn,
        },
        rules: {
            // ESLint recommended rules
            'no-unused-vars': 'off', // Handled by @typescript-eslint/no-unused-vars

            // Import sorting
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',
            'sort-imports': 'off',

            // Unused imports
            'unused-imports/no-unused-imports': 'error',

            // Formatting
            'no-multiple-empty-lines': ['warn', { max: 1 }],

            // Stylistic rules (moved from @typescript-eslint in v8)
            '@stylistic/indent': ['error', 4, {
                MemberExpression: 'off',
                SwitchCase: 1,
            }],
            '@stylistic/quotes': ['error', 'single', {
                allowTemplateLiterals: 'always',
                avoidEscape: true,
            }],

            // TypeScript rules
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': ['warn', {
                args: 'none',
                vars: 'all',
                varsIgnorePattern: '^.*_$',
            }],
            '@typescript-eslint/no-require-imports': 'off',

            // Mocha rules
            'mocha/no-exclusive-tests': 'error',
            'mocha/no-mocha-arrows': 'off',
            'mocha/no-setup-in-describe': 'off',

            // Unicorn rules
            'unicorn/empty-brace-spaces': 'off',
            'unicorn/switch-case-braces': ['error', 'avoid'],
            'unicorn/filename-case': ['error', {
                cases: {
                    kebabCase: true,
                    pascalCase: true,
                    camelCase: true,
                },
                ignore: [
                    '[a-z0-9_]+\\.spec\\.ts$',
                    '[a-z0-9_]+\\.steps\\.ts$',
                    'configure_serenity\\.ts',
                    'API',
                    'AST',
                    'BDD',
                    'CLI',
                    'CSS',
                    'DTO',
                    'FS',
                    'GAV',
                    'HTTP',
                    'JSON',
                    'MDX',
                    'UI',
                    'WebdriverIO',
                ],
            }],
            'unicorn/import-style': ['error', {
                styles: {
                    path: false,
                    'node:path': { named: true, default: true, namespace: true },
                    'node:util': { named: true, default: true, namespace: true },
                },
            }],
            'unicorn/no-array-for-each': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/no-static-only-class': 'off',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/prefer-array-flat': 'off',
            'unicorn/prefer-object-from-entries': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-node-protocol': 'off',
            'unicorn/prefer-spread': 'off',
            'unicorn/prevent-abbreviations': ['error', {
                allowList: {
                    acc: true,
                    arg: true,
                    args: true,
                    Args: true,
                    attrs: true,
                    conf: true,
                    createProp: true,
                    devtools: true,
                    doc: true,
                    Doc: true,
                    docString: true,
                    DocString: true,
                    e: true,
                    env: true,
                    fn: true,
                    fnAttrs: true,
                    i: true,
                    params: true,
                    pkg: true,
                    prop: true,
                    Prop: true,
                    Props: true,
                    props: true,
                    Ref: true,
                    Refs: true,
                    ref: true,
                    refs: true,
                    TOC: true,
                    toc: true,
                    temp: true,
                    utils: true,
                    wdio: true,
                },
            }],
        },
    },

    // Additional rules for packages/** (stricter)
    {
        files: ['packages/**/*.ts'],
        rules: {
            '@typescript-eslint/explicit-module-boundary-types': ['error', {
                allowHigherOrderFunctions: true,
            }],
            '@typescript-eslint/consistent-type-imports': 'error',
        },
    },
);
