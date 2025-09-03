import path from 'node:path';

import { describe, expect, it } from '../src/mcp-api.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

describe('Project Configure Playwright Test', () => {

    it('shows the agent how to add Serenity/JS reporter to the configuration file', async ({ client }) => {
        const pathToConfigFile = path.resolve(__dirname, '../examples/playwright-test-default-config/playwright.config.ts');
        const response = await client.callTool({
            name: 'serenity_project_configure_playwright_test',
            arguments: {
                pathToConfigFile,
            },
        });

        // expect(response.isError).not.toBe(true);
        expect(response.content[0].text).toMatch(/Configuration update required/);

        const { patch } = response.structuredContent.result;

        expect(patch).toEqual(`Index: ${ pathToConfigFile }
===================================================================
--- ${ pathToConfigFile }
+++ ${ pathToConfigFile }
@@ -1,9 +1,11 @@
 import { defineConfig, devices } from '@playwright/test';
+import { SerenityFixtures, SerenityWorkerFixtures } from '@serenity-js/playwright-test';
+
 /**
  * See https://playwright.dev/docs/test-configuration.
  */
-export default defineConfig({
+export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({
     testDir: './tests',
     /* Run tests in files in parallel */
     fullyParallel: true,
     /* Fail the build on CI if you accidentally left test.only in the source code. */
@@ -12,12 +14,37 @@
     retries: process.env.CI ? 2 : 0,
     /* Opt out of parallel tests on CI. */
     workers: process.env.CI ? 1 : undefined,
     /* Reporter to use. See https://playwright.dev/docs/test-reporters */
-    reporter: 'html',
+    reporter: [
+          [
+            '@serenity-js/playwright-test',
+            {
+              'crew': [
+                '@serenity-js/console-reporter',
+                [
+                  '@serenity-js/serenity-bdd',
+                  {
+                    'specDirectory': 'testDir: './tests''
+                  }
+                ],
+                [
+                  '@serenity-js/core:ArtifactArchiver',
+                  {
+                    'outputDirectory': './reports/serenity'
+                  }
+                ]
+              ]
+            }
+          ],
+          [
+            'html'
+          ]
+        ],
     /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
     use: {
         // baseURL: 'http://localhost:3000',
+        defaultActorName: 'Alice'
     },
     /* Configure projects for major browsers */
     projects: [
         { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
`);
    });
});
