import fs from 'node:fs/promises';
import path from 'node:path';

import { describe, expect, it } from '../../src/mcp-api.js';

describe('Project configure package.json scripts', () => {

    describe('dry run', () => {

        it('shows how the scripts section will be modified to add the scripts appropriate to the test runner', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test');
            const testRunner = '@playwright/test';
            const pathToPackageJsonFile = path.join(rootDirectory, 'package.json');
            const contentsBefore = await contentsOf(pathToPackageJsonFile);

            const response = await client.callTool({
                name: 'serenity_project_configure_package_json_scripts',
                arguments: {
                    pathToPackageJsonFile,
                    testRunner,
                    dryRun: true,
                },
            });

            expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.result.pathToPackageJsonFile).toEqual(pathToPackageJsonFile);
            expect(response.structuredContent.result.diff).toMatch(new RegExp([
                '\\+  "scripts": {',
                '\\+    "serenity": "failsafe serenity:clean serenity:run \\[\\.\\.\\.\\] test:report",',
                '\\+    "serenity:clean": "rimraf reports",',
                '\\+    "serenity:run": "playwright test",',
                '\\+    "serenity:report": "serenity-bdd run --source reports/serenity --destination reports/serenity"',
            ].join('\\n'), 'm'));

            const contentsAfter = await contentsOf(pathToPackageJsonFile);

            expect(contentsAfter).toEqual(contentsBefore);
        });
    });

    describe('regular run', () => {

        it('adds scripts section appropriate to the test runner', async ({ startClient, example }) => {
            const { client, stderr } = await startClient({
                args: [ '--experimental' ],
            });

            const rootDirectory = await example('playwright-test');
            const testRunner = '@playwright/test';
            const pathToPackageJsonFile = path.join(rootDirectory, 'package.json');

            const response = await client.callTool({
                name: 'serenity_project_configure_package_json_scripts',
                arguments: {
                    pathToPackageJsonFile,
                    testRunner,
                },
            });

            expect(stderr()).toBe('');
            expect(response.isError).toBe(false);

            expect(response.structuredContent.result.pathToPackageJsonFile).toEqual(pathToPackageJsonFile);
            expect(response.structuredContent.result.diff).toMatch(new RegExp([
                '\\+  "scripts": {',
                '\\+    "serenity": "failsafe serenity:clean serenity:run \\[\\.\\.\\.\\] test:report",',
                '\\+    "serenity:clean": "rimraf reports",',
                '\\+    "serenity:run": "playwright test",',
                '\\+    "serenity:report": "serenity-bdd run --source reports/serenity --destination reports/serenity"',
            ].join('\\n'), 'm'));

            const updatedPackageJson = JSON.parse(await contentsOf(pathToPackageJsonFile));

            expect(updatedPackageJson.scripts).toEqual({
                'serenity': 'failsafe serenity:clean serenity:run [...] test:report',
                'serenity:clean': 'rimraf reports',
                'serenity:run': 'playwright test',
                'serenity:report': `serenity-bdd run --source reports/serenity --destination reports/serenity`,
            });

            const instructions = response.structuredContent.instructions;

            expect(instructions).toEqual([ {
                type: 'callTool',
                target: 'serenity_project_configure_test_runner',
                reason: 'Configure the test runner to be used with this project'
            } ]);
        });
    });
});

async function contentsOf(pathToFile: string): Promise<string> {
    return fs.readFile(pathToFile, { encoding: 'utf8' });
}
