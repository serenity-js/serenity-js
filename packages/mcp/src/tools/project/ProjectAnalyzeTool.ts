import { z } from 'zod';

import type { Request, Response } from '../../mcp/index.js';
import { Tool } from '../../mcp/index.js';

export class ProjectAnalyzeTool extends Tool<typeof ProjectAnalyzeTool.inputSchema, typeof ProjectAnalyzeTool.resultSchema> {

    static readonly inputSchema = z.object({
        rootDirectory: z.string().describe('The absolute root directory of the project to analyze'),
    });

    static readonly resultSchema = z.object({
        status: z.string().describe('The status of the analysis, e.g. "success" or "failure"'),
    });

    protected async handle(
        request: Request<z.infer<typeof ProjectAnalyzeTool.inputSchema>>,
        response: Response<z.infer<typeof ProjectAnalyzeTool.resultSchema>>
    ): Promise<Response<z.infer<typeof ProjectAnalyzeTool.resultSchema>>> {

        const { rootDirectory } = request.parameters;

        return response.withResult({
            status: 'success',
        });
    }
}
