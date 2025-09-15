import { z } from 'zod';

import type { Context, Instruction, Request, Response, ToolConfig } from '../../../../src/mcp/index.js';
import { Tool } from '../../../../src/mcp/index.js';

export class ExampleNavigateToUrlTool extends Tool<typeof ExampleNavigateToUrlTool.inputSchema, typeof ExampleNavigateToUrlTool.resultSchema> {

    static readonly inputSchema = z.object({
        url: z.string().describe('The URL of the page to be checked, e.g. https://example.com'),
    });

    static readonly resultSchema = z.object({
        activity: z.object({
            imports: z.record(z.array(z.string())).describe('Node modules and their imports required to run the code'),
            template: z.string().describe('The activity performed by the tool'),
        }),
    });

    constructor(
        context: Context,
        config: Partial<ToolConfig<typeof ExampleNavigateToUrlTool.inputSchema, typeof ExampleNavigateToUrlTool.resultSchema>> = {},
        private readonly instructions: Instruction[] = [],
    ) {
        super(context, {
            inputSchema: ExampleNavigateToUrlTool.inputSchema,
            resultSchema: ExampleNavigateToUrlTool.resultSchema,
            annotations: {},
            _meta: {},
            ...config,
        });
    }

    protected async handle(
        request: Request<z.infer<typeof ExampleNavigateToUrlTool.inputSchema>>,
        response: Response<z.infer<typeof ExampleNavigateToUrlTool.resultSchema>>
    ): Promise<Response<z.infer<typeof ExampleNavigateToUrlTool.resultSchema>>> {

        const { url } = request.parameters;

        for (const instruction of this.instructions) {
            response.withInstructions(instruction);
        }

        return response.withResult({
            activity: {
                imports: {
                    '@serenity-js/web': [ 'Navigate' ],
                },
                template: `Navigate.to('${ url }')`,
            },
        });
    }
}
