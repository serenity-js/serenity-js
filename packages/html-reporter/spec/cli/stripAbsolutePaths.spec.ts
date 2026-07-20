import { expect, test } from '@playwright/test';

import { stripAbsolutePaths } from '../../app/utils/formatError';

test.describe('stripAbsolutePaths', () => {

    test('strips the absolute prefix up to the specDirectory marker', () => {
        const text = 'Error at /home/runner/work/project/spec/login.spec.ts:42:5';
        const result = stripAbsolutePaths(text, 'spec');

        expect(result).toBe('Error at spec/login.spec.ts:42:5');
    });

    test('handles multiple paths in a stack trace', () => {
        const stack = [
            'AssertionError: expected 1 to equal 2',
            '    at /home/runner/work/project/spec/login.spec.ts:42:5',
            '    at /home/runner/work/project/spec/helpers/setup.ts:15:3',
        ].join('\n');

        const result = stripAbsolutePaths(stack, 'spec');

        expect(result).toContain('spec/login.spec.ts:42:5');
        expect(result).toContain('spec/helpers/setup.ts:15:3');
        expect(result).not.toContain('/home/runner');
    });

    test('returns text unchanged when specDirectory is undefined', () => {
        const text = 'Error at /some/path/spec/file.ts:1:1';
        expect(stripAbsolutePaths(text, undefined)).toBe(text);
    });

    test('returns text unchanged when specDirectory marker is not found', () => {
        const text = 'Error at /some/path/src/file.ts:1:1';
        expect(stripAbsolutePaths(text, 'spec')).toBe(text);
    });

    test('handles paths with nested directories after the marker', () => {
        const text = 'at /Users/jan/Projects/serenity-js/examples/playwright-test-todomvc/spec/retries.spec.ts:11';
        const result = stripAbsolutePaths(text, 'spec');

        expect(result).toBe('at spec/retries.spec.ts:11');
    });

    test('returns empty string unchanged', () => {
        expect(stripAbsolutePaths('', 'spec')).toBe('');
    });

    test('preserves text that does not contain paths', () => {
        const text = 'Expected 1 to equal 2';
        expect(stripAbsolutePaths(text, 'spec')).toBe('Expected 1 to equal 2');
    });
});
