import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    { files: ['**/*.{js,mjs,cjs,ts}'] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                    prefix: ['I'],
                    filter: {
                        regex: '^(Request|Response|NextFunction|Express|JWT|Node)',
                        match: false,
                    },
                },
                {
                    selector: 'variable',
                    format: ['camelCase', 'UPPER_CASE'],
                },
            ],
            '@typescript-eslint/no-namespace': 'off',
            'no-console': [
                'error',
                {
                    allow: ['warn', 'error'],
                },
            ],
        },
    },
];
