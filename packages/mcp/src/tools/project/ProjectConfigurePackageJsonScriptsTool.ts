import fs from 'node:fs/promises';

import { createPatch } from 'diff';
import type { JSONObject } from 'tiny-types';
import { z } from 'zod';

import {
    CallToolInstruction,
    type Request,
    RequestUserActionInstruction,
    type Response,
    Tool,
    type ToolConfig,
    type ToolDependencies
} from '../../mcp/index.js';
import { DryRunSchema, TestRunnerNameSchema } from './schema.js';

const inputSchema = z.object({
    pathToPackageJsonFile: z.string().describe('The absolute path of the package.json configure'),
    testRunner: TestRunnerNameSchema.describe('The test runner used by the project, as detected by the serenity_project_analyze tool'),
    dryRun: DryRunSchema,
});

const resultSchema = z.object({
    pathToPackageJsonFile: z.string().describe('The absolute path of the package.json file that was updated'),
    diff: z.string().describe('A unified diff showing the changes made to the configuration file'),
});

export class ProjectConfigurePackageJsonScriptsTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Configure the package.json scripts in the project located in the specified root directory.',
                'This may involve updating the package.json file to ensure it includes scripts for running Serenity/JS with the detected test runner.',
            ].join(' '),
            inputSchema: inputSchema,
            resultSchema: resultSchema,
            annotations: {
                readOnlyHint: false,
                destructiveHint: true,
                idempotentHint: true,
                openWorldHint: false,
            }
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

        const { pathToPackageJsonFile, testRunner, dryRun } = request.parameters;

        const packageJsonContents = await fs.readFile(pathToPackageJsonFile, { encoding: 'utf8' });
        const packageJson = JSON.parse(packageJsonContents) as JSONObject;
        const updatedPackageJson = this.updateScripts(packageJson, testRunner);
        const updatedPackageJsonContents = JSON.stringify(updatedPackageJson, undefined, 2) + '\n';

        const diff = createPatch(pathToPackageJsonFile, packageJsonContents, updatedPackageJsonContents);

        response.withResult({
            pathToPackageJsonFile,
            diff
        });

        if (dryRun) {
            return response.withInstructions(
                new CallToolInstruction(
                    this.name(),
                    'To apply the proposed changes, call this tool again with dryRun: false',
                )
            );
        }

        try {
            await fs.writeFile(pathToPackageJsonFile, updatedPackageJsonContents, { encoding: 'utf8' });

            return response.withInstructions(
                new CallToolInstruction(
                    'serenity_project_configure_test_runner',
                    'Configure the test runner to be used with this project'
                )
            );
        }
        catch (error) {
            return response
                .withError(error)
                .withInstructions(new RequestUserActionInstruction(
                    'package.json',
                    'Use the provided diff to update package.json'
                ));
        }
    }

    private updateScripts(packageJson: JSONObject, testRunner: z.infer<typeof TestRunnerNameSchema>): JSONObject {
        const runScripts: Record<z.infer<typeof TestRunnerNameSchema>, string> = {
            '@cucumber/cucumber': 'cucumber-js',
            '@playwright/test': 'playwright test',
            '@wdio/cli': 'wdio',
            'cucumber': 'cucumber-js',
            'jasmine': 'jasmine',
            'mocha': 'mocha',
            'protractor': 'protractor',
        }

        const existingScripts = packageJson?.scripts as Record<string, string> | undefined;

        packageJson.scripts = {
            ...existingScripts,
            'serenity': 'failsafe serenity:clean serenity:run [...] test:report',
            'serenity:clean': 'rimraf reports',
            'serenity:run': runScripts[testRunner],
            'serenity:report': `serenity-bdd run --source reports/serenity --destination reports/serenity`,
        }

        return packageJson;
    }
}
