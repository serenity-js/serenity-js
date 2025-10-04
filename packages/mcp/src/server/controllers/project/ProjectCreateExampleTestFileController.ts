import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { ConfigurationError } from '@serenity-js/core';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { createPatch } from 'diff';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const ProjectCreateTestFileControllerInputSchema = z.object({
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

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof ProjectCreateTestFileControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
interface ProjectCreateTestFileControllerResult {
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

export class ProjectCreateExampleTestFileController implements CapabilityController<typeof ProjectCreateTestFileControllerInputSchema> {

    public static readonly capabilityPath = [`project`, `create_example_test_file`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Create an example test file demonstrating writing Serenity/JS test scenarios';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { frameworks } = ProjectCreateTestFileControllerInputSchema.parse(parameters);

            if (! frameworks.includes('playwright-test') ) {
                throw new ConfigurationError(`Only Playwright Test is supported at the moment`);
            }

            const patch = createPatch('api-documentation.spec.ts', '', trimmed`
            | import { describe, it, test } from '@serenity-js/playwright-test';
            | import { Task } from '@serenity-js/core';
            | import { Navigate } from '@serenity-js/web';
            | import { Ensure, endsWith, contain } from '@serenity-js/assertions';
            | import { PageElement, PageElements, By, Text } from '@serenity-js/web';
            |
            | class ApiDocsLandingPage {
            |   static path = '/api/';
            |
            |   private readonly articleElement = PageElement.located(By.css('article')).describedAs('article');
            |   private readonly titleElement = PageElement.located(By.css('header h1')).describedAs('title').of(this.articleElement);
            |   private readonly moduleNameElements = PageElements.located(By.css('h3>a:first-child').describedAs('module names').of(this.articleElement);
            |   
            |   open = () =>
            |     Task.where(\`#actor opens the API docs landing page\`,
            |       Navigate.to(ApiDocsLandingPage.path),
            |     );
            |   
            |   title = () =>
            |     Text.of(this.titleElement);
            |   
            |   moduleNames = () =>
            |     Text.ofAll(this.moduleNameElements)
            |       .map(name => name.trim())
            |       .describedAs('module names');
            | }
            |
            | describe('API Documentation', () => {
            |  
            |   // Playwright Test configuration can be overridden on a per-test basis
            |   test.use({
            |     baseURL: 'https://serenity-js.org',
            |   });
            | 
            |   it('should explain usage of all the available Serenity/JS modules', async ({ actor }) => {
            |     
            |     const apiDocs = new ApiDocsLandingPage(); 
            |
            |     await actor.attemptsTo(
            |         apiDocs.open(),
            |         Ensure.that(apiDocs.title(), endsWith('Serenity/JS API')),
            |         Ensure.that(apiDocs.moduleNames(), contain('@serenity-js/playwright-test')),
            |       );
            |   });
            | });
            |
            `);

            const result: ProjectCreateTestFileControllerResult = {
                result: {
                    patch,
                },
                instructions: [
                    trimmed `
                        | Create a test file called 'api-documentation.spec.ts' and place it in the test directory (e.g., "tests" or "e2e").
                        | The file contains a sample Playwright Test that uses Serenity/JS to interact with the Serenity/JS API documentation page and verify its content.
                        |
                        | Best practices:
                        | - The test file should be placed in the directory specified by the "testDir" property in your Playwright configuration file (e.g., "tests" or "e2e").
                        | - The file name should end with ".spec.ts" to ensure that Playwright Test recognizes it as a test file.
                        | - The description in the outer-most \`describe\` block (e.g. "Example") must match the name of the file (e.g. "example.spec.ts") and describe the high-level business feature being tested
                        | - The test case description in the \`it\` block (e.g. "should demonstrate interacting with the Serenity/JS website") should clearly describe the intended outcome of the test.
                        | - Default actor and the named actors can only be obtained from the test context (e.g. \`async ({ actor }) => { ... }\`, \`async ({ actorCalled }) => { ... }\`) and must not be imported directly from \`@serenity-js/core\`.
                        | - The actor's name (e.g. "Alice") can be changed to any name that suits your testing context.
                        | - Test files can be nested in sub-directories within the test directory to organise tests by business capability or theme.
                    `,
                ],
                nextSteps: [
                    'Create a test file based on the provided example and place it in the test directory directory.',
                ],
            };

            return {
                content: [
                    { type: 'text', text: trimmed `
                        | # Test file template
                        | 
                        | Create a test file as shown below:
                        | \`\`\`diff
                        | ${ patch }
                        | \`\`\`
                    ` },
                ],
                structuredContent: result as any,
                isError: false,
                annotations: {
                    title: ProjectCreateExampleTestFileController.description,
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: false
                }
            }
        }
        catch (error) {
            return {
                content: [{ type: 'text', text: String(error) }],
                isError: true,
                structuredContent: {},
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: ProjectCreateExampleTestFileController.capabilityPath,
            description: ProjectCreateExampleTestFileController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: ProjectCreateExampleTestFileController.toolName,
            description: ProjectCreateExampleTestFileController.description,
            inputSchema: zodToJsonSchema(ProjectCreateTestFileControllerInputSchema),
            // outputSchema
            annotations: {
                title: ProjectCreateExampleTestFileController.description,
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
