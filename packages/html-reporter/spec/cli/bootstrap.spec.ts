import { createRequire } from 'node:module';

import { expect, test } from '@playwright/test';

import { bootstrap } from '../../bin/bootstrap.mjs';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

function run(argv: string[]): Promise<{ error?: Error; parsed?: Record<string, unknown>; output?: string }> {
    return new Promise(resolve => {
        bootstrap(argv, (error, parsed, output) => {
            resolve({ error, parsed, output });
        });
    });
}

test.describe('html-reporter CLI', () => {

    test.describe('top-level', () => {

        test('shows help with available commands', async () => {
            const { error, output } = await run(['--help']);
            expect(error).toBeUndefined();
            expect(output).toContain('aggregate');
            expect(output).toContain('serve');
            expect(output).toContain('Usage: html-reporter <command> [options]');
        });

        test('shows version number', async () => {
            const { error, output } = await run(['--version']);
            expect(error).toBeUndefined();
            expect(output).toContain(pkg.version);
        });

        test('requires a command', async () => {
            const { error } = await run([]);
            expect(error).toBeDefined();
            expect(error.message).toContain('Please specify a command');
        });

        test('rejects unknown commands', async () => {
            const { error } = await run(['unknown']);
            expect(error).toBeDefined();
        });
    });

    test.describe('aggregate command', () => {

        test('shows help with all options', async () => {
            const { error, output } = await run(['aggregate', '--help']);
            expect(error).toBeUndefined();
            expect(output).toContain('--input');
            expect(output).toContain('--output');
            expect(output).toContain('--title');
            expect(output).toContain('--specRoot');
            expect(output).toContain('--maxHistory');
            expect(output).toContain('--consistencyWindow');
        });

        test('marks --input as required', async () => {
            const { output } = await run(['aggregate', '--help']);
            expect(output).toContain('[required]');
        });

        test('shows default value for --output', async () => {
            const { output } = await run(['aggregate', '--help']);
            expect(output).toContain('./reports/serenity-js');
        });

        test('shows default value for --consistencyWindow', async () => {
            const { output } = await run(['aggregate', '--help']);
            expect(output).toContain('[default: 5]');
        });

        test('fails when --input is missing', async () => {
            const { error } = await run(['aggregate']);
            expect(error).toBeDefined();
            expect(error.message).toContain('input');
        });

        test('rejects unknown options in strict mode', async () => {
            const { error } = await run(['aggregate', '--input', 'x', '--bogus']);
            expect(error).toBeDefined();
            expect(error.message).toContain('bogus');
        });
    });

    test.describe('serve command', () => {

        test('shows help with all options', async () => {
            const { error, output } = await run(['serve', '--help']);
            expect(error).toBeUndefined();
            expect(output).toContain('--dir');
            expect(output).toContain('--port');
            expect(output).toContain('--host');
            expect(output).toContain('--open');
        });

        test('shows default value for --dir', async () => {
            const { output } = await run(['serve', '--help']);
            expect(output).toContain('./reports/serenity-js');
        });

        test('shows default value for --port', async () => {
            const { output } = await run(['serve', '--help']);
            expect(output).toContain('8080');
        });

        test('shows default value for --host', async () => {
            const { output } = await run(['serve', '--help']);
            expect(output).toContain('0.0.0.0');
        });

        test('rejects unknown options in strict mode', async () => {
            const { error } = await run(['serve', '--bogus']);
            expect(error).toBeDefined();
            expect(error.message).toContain('bogus');
        });
    });
});
