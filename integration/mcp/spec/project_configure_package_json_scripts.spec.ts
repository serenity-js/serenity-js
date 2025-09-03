import path from 'node:path';

import { describe, expect, it } from '../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Configure package.json scripts', () => {

    it('adds scripts to an empty scripts section', async ({ client }) => {
        const pathToPackageJsonFile = path.resolve(__dirname, '../examples/package-json-empty-scripts/package.json');
        const response = await client.callTool({
            name: 'serenity_project_configure_package_json_scripts',
            arguments: {
                pathToPackageJsonFile,
                frameworks: ['playwright-test', 'playwright'],
            },
        });

        // expect(response.isError).not.toBe(true);
        expect(response.content[0].text).toMatch(/Configuration update required/);

        const { patch } = response.structuredContent.result;

        expect(patch).toEqual(`Index: ${ pathToPackageJsonFile }
===================================================================
--- ${ pathToPackageJsonFile }
+++ ${ pathToPackageJsonFile }
@@ -1,7 +1,12 @@
 {
   "name": "example-package-json-empty-scripts",
   "version": "1.0.0",
   "main": "index.js",
-  "scripts": {},
+  "scripts": {
+    "clean": "rimraf reports",
+    "test": "failsafe clean test:playwright [...] test:report",
+    "test:playwright": "playwright test",
+    "test:report": "serenity-bdd run --source reports/serenity --destination reports/serenity"
+  },
   "description": ""
 }
`);
    });

    it('adds scripts to a package.json with no scripts section', async ({ client }) => {
        const pathToPackageJsonFile = path.resolve(__dirname, '../examples/package-json-no-scripts/package.json');
        const response = await client.callTool({
            name: 'serenity_project_configure_package_json_scripts',
            arguments: {
                pathToPackageJsonFile,
                frameworks: ['playwright-test', 'playwright'],
            },
        });

        // expect(response.isError).not.toBe(true);
        expect(response.content[0].text).toMatch(/Configuration update required/);

        const { patch } = response.structuredContent.result;

        expect(patch).toEqual(`Index: ${ pathToPackageJsonFile }
===================================================================
--- ${ pathToPackageJsonFile }
+++ ${ pathToPackageJsonFile }
@@ -1,6 +1,12 @@
 {
   "name": "example-package-json-no-scripts",
   "version": "1.0.0",
   "main": "index.js",
-  "description": ""
+  "description": "",
+  "scripts": {
+    "clean": "rimraf reports",
+    "test": "failsafe clean test:playwright [...] test:report",
+    "test:playwright": "playwright test",
+    "test:report": "serenity-bdd run --source reports/serenity --destination reports/serenity"
+  }
 }
`);
    });

});
