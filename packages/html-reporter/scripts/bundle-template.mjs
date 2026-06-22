/**
 * Bundle Template Script
 *
 * Uses esbuild to bundle the template app (Preact, Chart.js, HTM, etc.)
 * into a single IIFE, then assembles the final index.html by injecting
 * the bundled JS and CSS into the HTML shell.
 *
 * Output: lib/template.js and esm/template.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSync } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(__dirname, '..');
const templateDir = resolve(packageRoot, 'template');

// --- Step 1: Bundle the app JS with esbuild (includes Chart.js, Preact, HTM, etc.) ---

const result = buildSync({
    entryPoints: [resolve(templateDir, 'app.tsx')],
    bundle: true,
    format: 'iife',
    write: false,
    minify: true,
    target: 'es2020',
    nodePaths: [resolve(packageRoot, 'node_modules')],
});

const allJs = new TextDecoder().decode(result.outputFiles[0].contents);

// --- Step 2: Read CSS ---

const styles = readFileSync(resolve(templateDir, 'styles.css'), 'utf8');

// --- Step 3: Assemble the final HTML ---

let shell = readFileSync(resolve(templateDir, 'shell.html'), 'utf8');
shell = shell.replace('/* __STYLES__ */', styles);
shell = shell.replace('/* __APP__ */', allJs);

// --- Step 4: Write outputs ---

const escaped = shell
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

const cjsContent = `"use strict";\nObject.defineProperty(exports, "__esModule", { value: true });\nexports.reportTemplate = \`${escaped}\`;\n`;
mkdirSync(resolve(packageRoot, 'lib'), { recursive: true });
writeFileSync(resolve(packageRoot, 'lib', 'template.js'), cjsContent, 'utf8');

const esmContent = `export const reportTemplate = \`${escaped}\`;\n`;
mkdirSync(resolve(packageRoot, 'esm'), { recursive: true });
writeFileSync(resolve(packageRoot, 'esm', 'template.js'), esmContent, 'utf8');

const dtsContent = `export declare const reportTemplate: string;\n`;
writeFileSync(resolve(packageRoot, 'lib', 'template.d.ts'), dtsContent, 'utf8');
writeFileSync(resolve(packageRoot, 'esm', 'template.d.ts'), dtsContent, 'utf8');

console.log(`Bundled template written to lib/template.js and esm/template.js (${Math.round(esmContent.length / 1024)}KB)`);
