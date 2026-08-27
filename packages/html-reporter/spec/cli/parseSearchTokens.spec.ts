import { expect, test } from '@playwright/test';

import { parseSearchTokens } from '../../app/utils/tag-search.js';

test.describe('parseSearchTokens', () => {

    test('parses a simple unquoted term', () => {
        expect(parseSearchTokens('hello')).toEqual(['hello']);
    });

    test('parses a quoted phrase as a single token', () => {
        expect(parseSearchTokens('"hello world"')).toEqual(['hello world']);
    });

    test('parses multiple terms', () => {
        expect(parseSearchTokens('foo bar')).toEqual(['foo', 'bar']);
    });

    test('parses a quoted phrase containing escaped double quotes', () => {
        expect(parseSearchTokens('"Expected property title that does equal \\"buy some cheese\\""'))
            .toEqual(['Expected property title that does equal "buy some cheese"']);
    });

    test('parses a quoted error message with embedded quotes', () => {
        const input = '"Expected <<persisted items>>[0] to have property title that does equal \\"buy some cheese\\""';
        const result = parseSearchTokens(input);
        expect(result).toEqual(['Expected <<persisted items>>[0] to have property title that does equal "buy some cheese"']);
    });

    test('parses a tag token alongside a quoted phrase with escaped quotes', () => {
        const input = '@browser:chromium "has property \\"done\\""';
        const result = parseSearchTokens(input);
        expect(result).toEqual(['@browser:chromium', 'has property "done"']);
    });
});
