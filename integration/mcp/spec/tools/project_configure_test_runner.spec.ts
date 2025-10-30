import fs from 'node:fs';

import { describe, expect, it } from '../../src/mcp-api.js';
import { ElicitRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('Project Configure Test Runner', () => {

    describe('dry run mode', () => {

        it('returns a diff showing how the configuration file would be changed', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test-default-config');

            const response = await client.callTool({
                name: 'serenity_project_configure_test_runner',
                arguments: {
                    rootDirectory,
                    testRunner: '@playwright/test',
                    dryRun: true,
                },
            });

            expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.instructions[0]).toEqual({
                target: 'serenity_project_configure_test_runner',
                type: 'callTool',
                reason: `To apply the proposed changes, call the serenity_project_configure_test_runner tool again with dryRun: false`
            });

            const expectedPathToConfigFile = `${ rootDirectory }/playwright.config.ts`;

            expect(response.structuredContent.result.pathToConfigurationFile).toEqual(expectedPathToConfigFile);
            expect(response.structuredContent.result.diff).toEqual(expectedConfigFileDiff(expectedPathToConfigFile));
        });

        it('requests confirmation if multiple configuration files are found', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test-multi-config');

            client.setRequestHandler(ElicitRequestSchema, async (request) => {
                expect(request.params.message).toMatch('Multiple configuration files found. Select the configuration file to update.')

                // todo: check the options
                // expect(request.params.configurationFile)

                return {
                    action: 'accept',
                    // todo: test cancelling
                    // todo: test selecting an invalid option
                };
            });

            const response = await client.callTool({
                name: 'serenity_project_configure_test_runner',
                arguments: {
                    rootDirectory,
                    testRunner: '@playwright/test',
                    dryRun: true,
                },
            });

            // expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.instructions[0]).toEqual({
                target: 'serenity_project_configure_test_runner',
                type: 'callTool',
                reason: `To apply the proposed changes, call the serenity_project_configure_test_runner tool again with dryRun: false`
            });

            const expectedPathToConfigFile = `${ rootDirectory }/playwright.config.ts`;

            expect(response.structuredContent.result.pathToConfigurationFile).toEqual(expectedPathToConfigFile);
            expect(response.structuredContent.result.diff).toEqual(expectedConfigFileDiff(expectedPathToConfigFile));
        });
    });

    describe('regular run', () => {

        it('updates the configuration file and returns a diff showing how it was changed', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test-default-config');

            const response = await client.callTool({
                name: 'serenity_project_configure_test_runner',
                arguments: {
                    rootDirectory,
                    testRunner: '@playwright/test',
                    // dryRun: false,   // defaults to false
                },
            });

            expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.instructions).toEqual([{
                target: 'serenity_project_run_tests',
                type: 'callTool',
                reason: `Run tests to ensure the project is configured correctly.`
            }, {
                target: 'serenity_project_create_test_file',
                type: 'callTool',
                reason: `Create a Serenity/JS test file`
            }]);

            const expectedPathToConfigFile = `${ rootDirectory }/playwright.config.ts`;

            expect(response.structuredContent.result.pathToConfigurationFile).toEqual(expectedPathToConfigFile);
            expect(response.structuredContent.result.diff).toEqual(expectedConfigFileDiff(expectedPathToConfigFile));

            const contents = fs.readFileSync(response.structuredContent.result.pathToConfigurationFile, { encoding: 'utf8' });

            expect(contents).toMatch(/export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>/);
        });
    });
});

function expectedConfigFileDiff(expectedPathToConfigFile: string): string {
    return `Index: ${ expectedPathToConfigFile }
===================================================================
--- ${ expectedPathToConfigFile }
+++ ${ expectedPathToConfigFile }
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
+                    'specDirectory': './tests'
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
`;
}
