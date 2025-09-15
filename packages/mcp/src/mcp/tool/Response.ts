import type { CallToolResultSchema, TextContentSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import type { Instruction, InstructionSchema } from './instructions.js';

export interface StructuredContent<Result extends Record<string, any>> {
    instructions: z.infer<typeof InstructionSchema>[];
    result: Result;
}

export class Response<Result extends Record<string, unknown>> {
    private result: Result = {} as Result;
    private readonly instructions: Instruction[] = [];

    constructor(private readonly outputSchema: z.Schema<StructuredContent<Result>>) {
    }

    withResult(result: Result): this {
        this.result = result;

        return this;
    }

    withInstructions(...instructions: Instruction[]): this {
        this.instructions.push(...instructions);

        return this;
    }

    toJSON(): z.infer<typeof CallToolResultSchema> {
        const structuredContent: StructuredContent<Result> = this.outputSchema.parse({
            result: this.result,
            instructions: this.instructions.map(instruction => instruction.toJSON()),
        });

        const serialisedResult = JSON.stringify(structuredContent.result, undefined, 0);
        const humanReadableInstructions = this.instructions.map((instruction, i) => `Instruction ${ i + 1 }: ${ instruction.description() }`);

        const content: Array<z.infer<typeof TextContentSchema>> = [
            serialisedResult,
            ...humanReadableInstructions
        ].map(text => ({ type: 'text', text }))

        return {
            isError: false,
            content: content ,
            structuredContent: structuredContent as unknown as { [k: string]: unknown },
        };
    }
}
