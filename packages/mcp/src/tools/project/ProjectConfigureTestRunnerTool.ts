import { z } from 'zod';

import type { Request, Response, ToolConfig, ToolDependencies } from '../../mcp/index.js';
import { Tool } from '../../mcp/index.js';
import { DryRunSchema, TestRunnerNameSchema } from './schema.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to configure'),
    testRunner: TestRunnerNameSchema.describe('The test runner used by the project, as detected by the serenity_project_analyze tool'),
    dryRun: DryRunSchema,
});

const resultSchema = z.object({
    pathToConfigurationFile: z.string().describe('The absolute path to the configuration file that was created or updated'),
    diff: z.string().describe('A unified diff showing the changes made to the configuration file'),
});

export class ProjectConfigureTestRunnerTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Configure the detected test runner in the project located in the specified root directory.',
                'This may involve creating or updating the test runner configuration file to ensure compatibility with Serenity/JS.',
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

        const { rootDirectory, testRunner, dryRun } = request.parameters;

        return response;
    }
}
