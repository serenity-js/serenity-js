/**
 * Bundle Template Script
 *
 * Reads the development template (template/index.html) and replaces CDN
 * script imports with inlined library code from node_modules.
 *
 * Output: lib/template.js and esm/template.js
 *
 * This runs AFTER tsc compilation so that the bundled template
 * is placed alongside the compiled output in both CJS and ESM directories.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');

// Read the development template
const templatePath = resolve(packageRoot, 'template', 'index.html');
let template = readFileSync(templatePath, 'utf8');

// --- Replace UMD script tags with inlined code ---

const umdReplacements = [
    {
        pattern: /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chart\.js@[^"]+"><\/script>/,
        file: resolve(packageRoot, 'node_modules', 'chart.js', 'dist', 'chart.umd.js'),
    },
    {
        pattern: /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/hammerjs@[^"]+"><\/script>/,
        file: resolve(packageRoot, 'node_modules', 'hammerjs', 'hammer.min.js'),
    },
    {
        pattern: /<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/chartjs-plugin-zoom@[^"]+"><\/script>/,
        file: resolve(packageRoot, 'node_modules', 'chartjs-plugin-zoom', 'dist', 'chartjs-plugin-zoom.min.js'),
    },
];

for (const { pattern, file } of umdReplacements) {
    const code = readFileSync(file, 'utf8');
    template = template.replace(pattern, `<script>${code}</script>`);
}

// --- Replace ES module imports with inlined code ---

const preactSource = readFileSync(resolve(packageRoot, 'node_modules', 'preact', 'dist', 'preact.module.js'), 'utf8');
const preactHooksSource = readFileSync(resolve(packageRoot, 'node_modules', 'preact', 'hooks', 'dist', 'hooks.module.js'), 'utf8');
const htmSource = readFileSync(resolve(packageRoot, 'node_modules', 'htm', 'dist', 'htm.module.js'), 'utf8');
const virtualCoreSource = readFileSync(resolve(packageRoot, 'node_modules', '@tanstack', 'virtual-core', 'dist', 'esm', 'index.js'), 'utf8');

const esmPreamble = `
// === Inlined: preact ===
const preactModule = (() => { ${preactSource}; return { h, render, Component }; })();
const { h, render, Component } = preactModule;

// === Inlined: preact/hooks ===
const hooksModule = (() => { ${preactHooksSource}; return { useState, useEffect, useMemo, useCallback, useRef }; })();
const { useState, useEffect, useMemo, useCallback, useRef } = hooksModule;

// === Inlined: htm ===
const htmModule = (() => { ${htmSource}; return htm; })();
const htm = htmModule.bind(h);
const html = htm;

// === Inlined: @tanstack/virtual-core ===
const virtualCoreModule = (() => { ${virtualCoreSource}; return { observeElementRect, observeElementOffset, elementScroll, Virtualizer, defaultRangeExtractor }; })();
const { observeElementRect, observeElementOffset, elementScroll, Virtualizer, defaultRangeExtractor } = virtualCoreModule;
`;

// Remove the ESM import lines and replace with inlined preamble
const esmImportPattern = /import\s*\{[^}]+\}\s*from\s*'https:\/\/esm\.sh\/[^']+';?\n?/g;
const htmImportPattern = /import\s+htm\s+from\s+'https:\/\/esm\.sh\/[^']+';?\n?/;

template = template.replace(esmImportPattern, '');
template = template.replace(htmImportPattern, '');

// Insert preamble after the <script type="module"> opening tag
template = template.replace(
    /(<script type="module">)/,
    `<script>\n${esmPreamble}\n`
);

// --- Write to both lib/ and esm/ ---

const escaped = template
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

// CJS output
const cjsContent = `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.reportTemplate = \`${escaped}\`;\n`;
mkdirSync(resolve(packageRoot, 'lib'), { recursive: true });
writeFileSync(resolve(packageRoot, 'lib', 'template.js'), cjsContent, 'utf8');

// ESM output
const esmContent = `export const reportTemplate = \`${escaped}\`;\n`;
mkdirSync(resolve(packageRoot, 'esm'), { recursive: true });
writeFileSync(resolve(packageRoot, 'esm', 'template.js'), esmContent, 'utf8');

// Declaration file (shared)
const dtsContent = `export declare const reportTemplate: string;\n`;
writeFileSync(resolve(packageRoot, 'lib', 'template.d.ts'), dtsContent, 'utf8');
writeFileSync(resolve(packageRoot, 'esm', 'template.d.ts'), dtsContent, 'utf8');

console.log(`Bundled template written to lib/template.js and esm/template.js (${Math.round(esmContent.length / 1024)}KB)`);
