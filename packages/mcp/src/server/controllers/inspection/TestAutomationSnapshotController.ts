import type { CallToolResult, Tool } from '@modelcontextprotocol/sdk/types.js';
import { trimmed } from '@serenity-js/core/lib/io/index.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { ScreenplayExecutionContext } from '../../context/index.js';
import { Imports } from '../../context/index.js';
import type { CapabilityDescriptor } from '../../schema.js';
import { ActorNameSchema } from '../../schema.js';
import { type CapabilityController } from '../CapabilityController.js';

const TestAutomationPageElementInspectorControllerInputSchema = z.object({
    actorName: ActorNameSchema,
})

type ProjectAnalyzeDependenciesControllerInput = z.infer<typeof TestAutomationPageElementInspectorControllerInputSchema>;

// todo: standardise the result/instructions/nextSteps structure across all Project controllers
// interface TestAutomationPageElementInspectorControllerResult {
//     result: {
//         elements: string;
//     };
//     instructions: string[];
//     nextSteps: string[];
// }

// const ProjectAnalyzeDependenciesControllerOutputSchema = z.object({
//     dependencyScanResult: z.object({
//         dependencies: z.array(z.string().describe('The name of the dependency')),
//         recommendations: z.array(z.string()).describe('Recommended actions to address any detected issues'),
//         nextSteps: z.array(z.string()).describe('Suggested next steps after addressing any detected issues'),
//     }).describe(`The result of scanning the project's Node.js dependencies`),
// });

// type ProjectAnalyzeDependenciesControllerOutput = z.infer<typeof ProjectAnalyzeDependenciesControllerOutputSchema>;

export class TestAutomationSnapshotController implements CapabilityController<typeof TestAutomationPageElementInspectorControllerInputSchema> {

    public static readonly capabilityPath = [`inspection`, `snapshot`];
    public static toolName = `serenity_${ this.capabilityPath.join('_') }`;

    private static description = 'Capture an accessibility snapshot of the website to detect the elements of interest';

    async execute(context: ScreenplayExecutionContext, parameters: ProjectAnalyzeDependenciesControllerInput): Promise<CallToolResult> {
        try {
            const { actorName } = TestAutomationPageElementInspectorControllerInputSchema.parse(parameters);

            const imports = new Imports({
                '@serenity-js/web': [ 'Page' ],
            });

            // https://github.com/microsoft/playwright/blob/dea31d86d647353ab68ea2e61e425077cbfc200b/packages/playwright/src/mcp/browser/tab.ts#L196

            const url = await context.answerAs(actorName, { imports, value: 'Page.current().url().href' });
            const title = await context.answerAs(actorName, { imports, value: 'Page.current().title()' });
            const snapshot = await context.answerAs(actorName, { imports, value: 'Page.current().nativePage()._snapshotForAI()' });

            const result = {
                url,
                title,
                ariaSnapshot: snapshot,
            }

            return {
                content: [
                    { type: 'text', text: trimmed `
                        | # Page Element Inspector
                        |
                        | Url: ${ url }
                        | Title: ${ title }
                        |
                        | ## ARIA Snapshot
                        | 
                        | \`\`\`
                        | ${ snapshot }
                        | \`\`\`    
                    ` }
                ],
                structuredContent: result as any,
                isError: false,
                annotations: {
                    title: TestAutomationSnapshotController.description,
                    readOnlyHint: true,
                    destructiveHint: false,
                    openWorldHint: true
                }
            }
        }
        catch (error) {
            console.warn({ error });

            return {
                content: [{ type: 'text', text: String(error) }],
                isError: true,
                structuredContent: {},
            }
        }
    }

    capabilityDescriptor(): CapabilityDescriptor {
        return {
            path: TestAutomationSnapshotController.capabilityPath,
            description: TestAutomationSnapshotController.description,
        };
    }

    toolDescriptor(): Tool {
        return {
            name: TestAutomationSnapshotController.toolName,
            description: TestAutomationSnapshotController.description,
            inputSchema: zodToJsonSchema(TestAutomationPageElementInspectorControllerInputSchema),
            // outputSchema
            annotations: {
                title: TestAutomationSnapshotController.description,
                readOnlyHint: true,
                destructiveHint: false,
                openWorldHint: true,
            },
        } as Tool;
    }
}
