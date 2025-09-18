import { z } from 'zod';

import type { Request, Response, ToolConfig, ToolDependencies } from '../../mcp/index.js';
import { Tool } from '../../mcp/index.js';

const inputSchema = z.object({
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
});

const resultSchema = z.object({
    status: z.string().describe('The status of the analysis, e.g. "success" or "failure"'),
    rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
});

export class ProjectAnalyzeTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(dependencies: ToolDependencies, config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {}) {
        super(dependencies, {
            ...config,
            description: [
                'Analyze a Node.js project in the specified root directory to assess compatibility with Serenity/JS.',
                'Check for any runtime issues, explain their root causes, and provide recommended fixes.'
            ].join(' '),
            inputSchema: inputSchema,
            resultSchema: resultSchema,
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

        const { rootDirectory } = request.parameters;

        return response.withResult({
            status: 'success',
            rootDirectory,
        });
    }
}
