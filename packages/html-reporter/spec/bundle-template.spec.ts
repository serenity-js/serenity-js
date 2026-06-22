import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect, test } from '@playwright/test';

test.describe('bundle-template', () => {

    // The bundled template is generated at compile time by scripts/bundle-template.mjs
    // These tests verify the output meets air-gap requirements.

    const thisDirectory = dirname(fileURLToPath(import.meta.url));
    const templatePath = resolve(thisDirectory, '..', 'esm', 'template.js');

    function readBundledTemplate(): string {
        return readFileSync(templatePath, 'utf8');
    }

    test('produces a template.ts file', () => {
        const content = readBundledTemplate();

        expect(content).toContain('reportTemplate');
    });

    test('does not contain CDN script tags', () => {
        const content = readBundledTemplate();

        expect(content).not.toContain('cdn.jsdelivr.net');
        expect(content).not.toContain('esm.sh');
        expect(content).not.toContain('unpkg.com');
    });

    test('inlines Chart.js library code', () => {
        const content = readBundledTemplate();

        // Chart.js UMD bundle defines the Chart global
        expect(content).toContain('Chart');
    });

    test('inlines Preact library code', () => {
        const content = readBundledTemplate();

        expect(content).toContain('preact');
    });

    test('inlines @tanstack/virtual-core library code', () => {
        const content = readBundledTemplate();

        expect(content).toContain('Virtualizer');
    });

    test('inlines HTM library code', () => {
        const content = readBundledTemplate();

        expect(content).toContain('htm');
    });

    test('retains the data.js script reference', () => {
        const content = readBundledTemplate();

        expect(content).toContain('./data.js');
    });
});
