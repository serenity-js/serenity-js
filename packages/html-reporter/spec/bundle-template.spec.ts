import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect } from '@integration/testing-tools';
import { describe, it } from 'mocha';

describe('bundle-template', () => {

    // The bundled template is generated at compile time by scripts/bundle-template.mjs
    // These tests verify the output meets air-gap requirements.

    const thisDirectory = dirname(fileURLToPath(import.meta.url));
    const templatePath = resolve(thisDirectory, '..', 'src', 'template.ts');

    function readBundledTemplate(): string {
        return readFileSync(templatePath, 'utf8');
    }

    it('produces a template.ts file', () => {
        const content = readBundledTemplate();

        expect(content).to.contain('export const reportTemplate');
    });

    it('does not contain CDN script tags', () => {
        const content = readBundledTemplate();

        expect(content).not.to.contain('cdn.jsdelivr.net');
        expect(content).not.to.contain('esm.sh');
        expect(content).not.to.contain('unpkg.com');
    });

    it('inlines Chart.js library code', () => {
        const content = readBundledTemplate();

        // Chart.js UMD bundle defines the Chart global
        expect(content).to.contain('Chart');
    });

    it('inlines Preact library code', () => {
        const content = readBundledTemplate();

        expect(content).to.contain('preact');
    });

    it('inlines @tanstack/virtual-core library code', () => {
        const content = readBundledTemplate();

        expect(content).to.contain('Virtualizer');
    });

    it('inlines HTM library code', () => {
        const content = readBundledTemplate();

        expect(content).to.contain('htm');
    });

    it('retains the data.js script reference', () => {
        const content = readBundledTemplate();

        expect(content).to.contain('./data.js');
    });
});
