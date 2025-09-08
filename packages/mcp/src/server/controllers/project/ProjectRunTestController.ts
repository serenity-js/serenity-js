import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const ProjectRunTestControllerInputSchema = z.object({
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

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof ProjectRunTestControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
interface ProjectRunTestControllerResult {
    result: {
        commands: Record<string, string>;
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

export class ProjectRunTestController implements CapabilityController<typeof ProjectRunTestControllerInputSchema> {

    public static readonly capabilityPath = [`project`, `run_test`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Discover the commands to run Serenity/JS test scenarios';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { frameworks } = ProjectRunTestControllerInputSchema.parse(parameters);

            if (! frameworks.includes('playwright') && ! frameworks.includes('playwright-test')) {
                return {
                    content: [
                        { type: 'text', text: trimmed `
                            | # Unsupported framework
                            |
                            | The \`configure_package_json_scripts\` capability currently supports only projects using Playwright or Playwright Test frameworks.
                            | Detected frameworks: ${ frameworks.join(', ') }.
                            |
                            | To configure NPM scripts for other test frameworks, please refer to the [Serenity/JS documentation](https://serenity-js.org/handbook/test-runners/).
                        ` },
                    ],
                    structuredContent: {} as any,
                }
            }

            const commands = {
                'run_all_tests': 'npm run test:playwright -- --reporter=list',
                'run_test_file': 'npm run test:playwright -- path/to/test/file --reporter=list',
                'run_test_by_name': 'npm run test:playwright -- -g "test name" --reporter=list',
            }

            const result: ProjectRunTestControllerResult = {
                result: {
                    commands,
                },
                instructions: [
                    'Run the appropriate command to execute tests in your project',
                ],
                nextSteps: [
                ],
            };

            return {
                content: [
                    { type: 'text', text: trimmed `
                        | # Running tests
                        | 
                        | To run the tests in your project using Playwright with Serenity/JS, you can use the following NPM commands:
                        | - **Run all tests**: \`${ commands.run_all_tests }\`
                        | - **Run a specific test file**: \`${ commands.run_test_file }\`
                        | - **Run a specific test by name**: \`${ commands.run_test_by_name }\`
                        | 
                        | You can copy and paste these commands into your terminal to execute them.
                    ` },
                ],
                structuredContent: result as any,
                isError: false,
                annotations: {
                    title: ProjectRunTestController.description,
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
            path: ProjectRunTestController.capabilityPath,
            description: ProjectRunTestController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectRunTestController.toolName,
            description: ProjectRunTestController.description,
            inputSchema: zodToJsonSchema(ProjectRunTestControllerInputSchema),
            // outputSchema
            annotations: {
                title: 'Run Tests with Serenity/JS',
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
