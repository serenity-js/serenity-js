/**
 * Bundle Template Script
 *
 * Uses esbuild to bundle the template app into a single IIFE,
 * then constructs the final index.html programmatically.
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

// --- Step 1: Bundle the app JS ---

const result = buildSync({
    entryPoints: [resolve(templateDir, 'app.tsx')],
    bundle: true,
    format: 'iife',
    write: false,
    minify: true,
    target: 'es2020',
    nodePaths: [resolve(packageRoot, 'node_modules')],
});

const appJs = new TextDecoder().decode(result.outputFiles[0].contents);

// --- Step 2: Read CSS ---

const styles = readFileSync(resolve(templateDir, 'styles.css'), 'utf8');

// --- Step 3: Construct HTML ---

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Serenity/JS Report</title>
  <link rel="icon" type="image/png" sizes="32x32" href="https://serenity-js.org/icons/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="https://serenity-js.org/icons/favicon-16x16.png">
  <link rel="apple-touch-icon" href="https://serenity-js.org/icons/apple-touch-icon.png">
  <style>
${styles}
  </style>
</head>
<body>
  <div id="app"></div>
  <script src="./data.js"></script>
  <script>${appJs}</script>
</body>
</html>`;

// --- Step 4: Write outputs ---

const escaped = html
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
