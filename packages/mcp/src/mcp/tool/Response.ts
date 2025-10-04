import type { CallToolResultSchema, TextContentSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import type { Instruction, InstructionSchema } from './instructions.js';

export interface StructuredContent<Result extends Record<string, any>> {
    instructions: z.infer<typeof InstructionSchema>[];
    result?: Result;
    error?: { name: string, message: string, stack?: string };
}

export class Response<Result extends Record<string, unknown>> {
    private result?: Result;
    private summary?: string;
    private error?: Error;
    private readonly instructions: Instruction[] = [];

    constructor(private readonly outputSchema: z.Schema<StructuredContent<Result>>) {
    }

    withSummary(summary: string): this {
        this.summary = summary;

        return this;
    }

    withResult(result: Result): this {
        this.result = result;

        return this;
    }

    withInstructions(...instructions: Instruction[]): this {
        this.instructions.push(...instructions);

        return this;
    }

    withError(error: Error): this {
        this.error = error;
        return this;
    }

    toJSON(): z.infer<typeof CallToolResultSchema> {

        const structuredContent: StructuredContent<Result> = this.outputSchema.parse({
            result: this.result,
            error: this.error ? { name: this.error.name, message: this.error.message, stack: this.error.stack } : undefined,
            instructions: this.instructions.map(instruction => instruction.toJSON()),
        });

        const serialisedStructuredContent = JSON.stringify(structuredContent, undefined, 0);
        const humanReadableInstructions = this.instructions
            .map((instruction, i) => `Instruction ${ i + 1 }: ${ instruction.title() }\n\n${ instruction.description() }`);

        const content: Array<z.infer<typeof TextContentSchema>> = [
            serialisedStructuredContent,
            this.summary,
            ...humanReadableInstructions
        ].filter(Boolean).map(text => ({ type: 'text', text }));

        return {
            isError: Boolean(this.error),
            content: content,
            structuredContent: structuredContent as unknown as { [k: string]: unknown },
        };
    }
}
