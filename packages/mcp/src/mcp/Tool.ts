import type {
    CallToolRequestSchema,
    CallToolResultSchema,
    ToolAnnotations,
    ToolSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { ZodSchema } from 'zod';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { Context } from './Context.js';
import { InstructionSchema } from './instructions.js';
import { Request } from './Request.js';
import type { StructuredContent } from './Response.js';
import { Response } from './Response.js';

export interface ToolConfig<InputSchema extends ZodSchema, ResultSchema extends ZodSchema> {
    name: string;
    description: string;
    inputSchema: InputSchema;
    resultSchema: ResultSchema;
    annotations: ToolAnnotations;
    _meta: Record<string, unknown>;
}

interface ToolSchema<InputSchema extends ZodSchema, ResultSchema extends ZodSchema> {
    name: string;
    description: string;
    inputSchema: InputSchema;
    outputSchema: z.Schema<StructuredContent<z.infer<ResultSchema>>>;
    annotations: ToolAnnotations;
    _meta: Record<string, unknown>;
}

export abstract class Tool<
    InputSchema extends ZodSchema,
    ResultSchema extends ZodSchema
> {
    private readonly schema: ToolSchema<InputSchema, ResultSchema>;

    protected constructor(
        protected readonly context: Context,
        config: Partial<ToolConfig<InputSchema, ResultSchema>>,
    ) {
        this.schema = {
            name: config.name,
            description: config.description,
            inputSchema: config.inputSchema,
            outputSchema: z.object({
                result: config.resultSchema,
                instructions: z.array(InstructionSchema).describe('Instructions on how to use the result'),
            }) as z.Schema<StructuredContent<z.infer<ResultSchema>>>,
            annotations: config.annotations ?? {},
            _meta: config._meta,
        };
    }

    name(): string {
        if (this.schema.name) {
            return this.schema.name;
        }

        return this.constructor.name
            // Remove "Tool" suffix if present
            .replace(/Tool$/, '')
            // Insert _ before uppercase letters that are followed by lowercase letters
            .replaceAll(/([\da-z])([A-Z])/g, '$1_$2')
            // Insert _ between sequences of uppercase letters and the next lowercase letter
            .replaceAll(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
            .toLowerCase();
    }

    public matches(toolName: z.infer<typeof CallToolRequestSchema>['params']['name']): boolean {
        return this.name() === toolName;
    }

    async callTool(callToolArguments: z.infer<InputSchema>): Promise<z.infer<typeof CallToolResultSchema>> {
        try {
            const parameters = this.schema.inputSchema?.parse(callToolArguments);

            const request = new Request<z.infer<InputSchema>>(parameters ?? {});
            const initialResponse = new Response<z.infer<ResultSchema>>(this.schema.outputSchema);

            const response = await this.handle(request, initialResponse);

            return response.toJSON();
        }
        catch (error) {
            return this.unhandledErrorResult(error);
        }
    }

    descriptor(): z.infer<typeof ToolSchema> {
        return {
            name: this.schema.name,
            description: this.schema.description,
            inputSchema: zodToJsonSchema(this.schema.inputSchema, { strictUnions: true }) as z.infer<typeof ToolSchema>['inputSchema'],
            outputSchema: zodToJsonSchema(this.schema.outputSchema, { strictUnions: true }) as z.infer<typeof ToolSchema>['outputSchema'],
            _meta: {
                ...this.schema._meta
            },
            annotations: {
                ...this.schema.annotations
            },
        };
    }

    protected abstract handle(
        request: Request<z.infer<InputSchema>>,
        response: Response<z.infer<ResultSchema>>
    ): Promise<Response<z.infer<ResultSchema>>>;

    private unhandledErrorResult(error: Error): z.infer<typeof CallToolResultSchema> {
        return {
            isError: true,
            content: [{ type: 'text', text: String(error.stack) }],
            structuredContent: {
                error: {
                    name: error?.name,
                    message: error?.message,
                    stack: error?.stack
                }
            }
        }
    }
}
