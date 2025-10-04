import { z } from 'zod';

import type {
    Instruction, InstructionSchema,
    Request,
    Response,
    StructuredContent,
    ToolConfig,
    ToolDependencies
} from '../../../../src/mcp/index.js';
import { Tool } from '../../../../src/mcp/index.js';

const inputSchema = z.object({
    url: z.string().describe('The URL of the page to be checked, e.g. https://example.com'),
});

const resultSchema = z.object({
    activity: z.object({
        imports: z.record(z.array(z.string())).describe('Node modules and their imports required to run the code'),
        template: z.string().describe('The activity performed by the tool'),
    }),
});

export const exampleNavigateToUrlStructuredContent = (url: string, instructions: Array<z.infer<typeof InstructionSchema>> = []): StructuredContent<z.infer<typeof resultSchema>> => {
    return {
        result: {
            activity: {
                imports: {
                    '@serenity-js/web': [
                        'Navigate',
                    ],
                },
                template: `Navigate.to('${ url }')`,
            }
        },
        instructions,
    }
};

export class ExampleNavigateToUrlTool extends Tool<typeof inputSchema, typeof resultSchema> {

    constructor(
        dependencies: ToolDependencies,
        config: Partial<ToolConfig<typeof inputSchema, typeof resultSchema>> = {},
        private readonly instructions: Instruction[] = [],
    ) {
        super(dependencies, {
            inputSchema: inputSchema,
            resultSchema: resultSchema,
            annotations: {},
            _meta: {},
            ...config,
        });
    }

    protected async handle(
        request: Request<z.infer<typeof inputSchema>>,
        response: Response<z.infer<typeof resultSchema>>
    ): Promise<Response<z.infer<typeof resultSchema>>> {

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
