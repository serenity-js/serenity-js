import fs from 'node:fs/promises';

import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { createPatch } from 'diff';
import type { JSONObject } from 'tiny-types';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const ProjectConfigurePackageJsonScriptsControllerInputSchema = z.object({
    pathToPackageJsonFile: z.string().describe('Absolute path to the package.json file, e.g., `/path/to/project/package.json`'),
    frameworks: z.array(z.enum([
        'cucumber',
        'jasmine',
        'mocha',
        'playwright-test',
        'playwright',
        'webdriverio',
        'webdriverio-8',
        'protractor',
        'unknown',
    ])).describe('List of frameworks detected in the project using the `analyze_dependencies` capability'),
})

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof ProjectConfigurePackageJsonScriptsControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
interface ProjectConfigurePlaywrightTestControllerResult {
    result: {
        patch: string;
    };
    instructions: string[];
    nextSteps: string[];
}

// const ProjectAnalyzeDependenciesControllerOutputSchema = z.object({
//     dependencyScanResult: z.object({
//         dependencies: z.array(z.string().describe('The name of the dependency')),
//         recommendations: z.array(z.string()).describe('Recommended actions to address any detected issues'),
//         nextSteps: z.array(z.string()).describe('Suggested next steps after addressing any detected issues'),
//     }).describe(`The result of scanning the project's Node.js dependencies`),
// });

// type ProjectAnalyzeDependenciesControllerOutput = z.infer<typeof ProjectAnalyzeDependenciesControllerOutputSchema>;

export class ProjectConfigurePackageJsonScriptsController implements CapabilityController<typeof ProjectConfigurePackageJsonScriptsControllerInputSchema> {

    public static readonly capabilityPath = [`project`, `configure_package_json_scripts`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Configure NPM scripts in package.json to include commands for running tests with Serenity/JS';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { pathToPackageJsonFile /*, frameworks */ } = ProjectConfigurePackageJsonScriptsControllerInputSchema.parse(parameters);

            const packageJsonContents = await fs.readFile(pathToPackageJsonFile, { encoding: 'utf8' });
            const packageJson = JSON.parse(packageJsonContents);

            const updatedPackageJson = this.updateScripts(packageJson);
            const updatedPackageJsonContents = JSON.stringify(updatedPackageJson, undefined, 2) + '\n';

            const patch = createPatch(pathToPackageJsonFile, packageJsonContents, updatedPackageJsonContents);

            const result: ProjectConfigurePlaywrightTestControllerResult = {
                result: {
                    patch,
                },
                instructions: [
                    'Apply the proposed diff to the package.json file',
                    'To run all the tests in the project and generate Serenity BDD reports, use the command: npm test',
                    'To run all the tests in the project quickly without generating Serenity BDD reports, use the command: npm run test:playwright -- --reporter=list',
                    'To run a specific test file and generate Serenity BDD reports, use the command: npm run test:playwright -- path/to/test/file',
                    'To quickly run a specific test file without generating Serenity BDD reports, use the command: npm run test:playwright -- path/to/test/file --reporter=list',
                    'To run a specific test by its name and generate Serenity BDD reports, use the command: npm run test:playwright -- -g "test name"',
                    'To quickly run a specific test by its name without generating Serenity BDD reports, use the command: npm run test:playwright -- -g "test name" --reporter=list',
                    'After running the tests, you can find the Serenity BDD reports in the ./reports/serenity directory',
                ],
                nextSteps: [
                    'If the user is happy with the proposed changes, save the updated configuration file.',
                    'Run all the tests in the project to ensure everything is working as expected.',
                ],
            };

            return {
                content: [
                    { type: 'text', text: trimmed `
                        | # Configuration update required
                        | 
                        | Update the package.json file as follows:
                        | \`\`\`diff
                        | ${ patch }
                        | \`\`\`
                    ` },
                ],
                structuredContent: result as any,
                isError: false,
                annotations: {
                    title: ProjectConfigurePackageJsonScriptsController.description,
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: true
                }
            }
        }
        catch (error) {
            console.error(error)
            return {
                content: [{ type: 'text', text: String(error) }],
                isError: true,
                structuredContent: {},
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: ProjectConfigurePackageJsonScriptsController.capabilityPath,
            description: ProjectConfigurePackageJsonScriptsController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectConfigurePackageJsonScriptsController.toolName,
            description: ProjectConfigurePackageJsonScriptsController.description,
            inputSchema: zodToJsonSchema(ProjectConfigurePackageJsonScriptsControllerInputSchema),
            // outputSchema
            annotations: {
                title: 'Configure Playwright Test',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }

    private updateScripts(packageJson: JSONObject): JSONObject {
        const scripts = packageJson.scripts as Record<string, string> || {};

        packageJson.scripts = {
            ...scripts,
            clean: 'rimraf reports',
            test: 'failsafe clean test:playwright [...] test:report',
            'test:playwright': 'playwright test',
            'test:report': 'serenity-bdd run',
        };

        return packageJson;
    }
}
