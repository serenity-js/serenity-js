import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { expect,test as base } from '@playwright/test';
import { buildSync } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_DIR = resolve(__dirname, '../../template');
const PACKAGE_ROOT = resolve(__dirname, '../..');
const STYLES = readFileSync(resolve(TEMPLATE_DIR, 'styles.css'), 'utf8');

export interface MountOptions {
    component: string;       // Component name, e.g. 'FilterBar'
    importPath: string;      // Import path relative to template/, e.g. './components/FilterBar'
    props?: Record<string, unknown>;
    data?: unknown;          // Injected as window.__SERENITY_REPORT_DATA__
    chartJs?: boolean;       // Whether to load Chart.js (default: false)
}

export const test = base.extend<{ mount: (options: MountOptions) => Promise<void> }>({
    mount: async ({ page }, use) => {
        const mount = async ({ component, importPath, props = {}, data = {}, chartJs = false }: MountOptions) => {
            const entryCode = [
                `import htm from 'htm';`,
                `import { h, render } from 'preact';`,
                `import { ${component} } from '${importPath}';`,
                `const html = htm.bind(h);`,
                `const props = ${JSON.stringify(props)};`,
                // Replace string-valued props starting with '__' with window function references
                `for (const [k, v] of Object.entries(props)) { if (typeof v === 'string' && v.startsWith('__') && typeof window[v] === 'function') props[k] = window[v]; }`,
                `render(html\`<\${${component}} ...\${props} />\`, document.getElementById('app'));`,
            ].join('\n');

            const result = buildSync({
                stdin: { contents: entryCode, resolveDir: TEMPLATE_DIR, loader: 'ts' },
                bundle: true,
                write: false,
                format: 'iife',
                target: 'es2020',
                nodePaths: [resolve(PACKAGE_ROOT, 'node_modules')],
            });

            const appJs = new TextDecoder().decode(result.outputFiles[0].contents);

            const chartScripts = chartJs
                ? [
                    readFileSync(resolve(PACKAGE_ROOT, 'node_modules/chart.js/dist/chart.umd.js'), 'utf8'),
                    readFileSync(resolve(PACKAGE_ROOT, 'node_modules/hammerjs/hammer.min.js'), 'utf8'),
                    readFileSync(resolve(PACKAGE_ROOT, 'node_modules/chartjs-plugin-zoom/dist/chartjs-plugin-zoom.min.js'), 'utf8'),
                ].join(';\n')
                : '';

            const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head><meta charset="UTF-8"><style>${STYLES}</style></head>
<body>
  <div id="app"></div>
  <script>window.__SERENITY_REPORT_DATA__ = ${JSON.stringify(data)};</script>
  ${chartScripts ? `<script>${chartScripts}</script>` : ''}
  <script>${appJs}</script>
</body>
</html>`;

            await page.route('**/test-harness.html', route => {
                route.fulfill({ contentType: 'text/html', body: html });
            });
            await page.goto('http://localhost/test-harness.html', { waitUntil: 'load' });
        };

        await use(mount);
    },
});

export { expect };
