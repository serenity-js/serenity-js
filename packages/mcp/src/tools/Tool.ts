import type { ImageContent, TextContent } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import type { McpSessionContext } from '../server/McpSessionContext.js';

export type InputSchema = z.Schema;

// todo: review
// export type ToolCapability = 'web' | 'core' | 'rest';

export interface ToolSchema<Input extends InputSchema> {
    name: string;
    title: string;
    description: string;
    inputSchema: Input;
    // outputSchema: Output;
    type: 'readonly' | 'destructive';
}

export type ToolActionResult = { content?: Array<ImageContent | TextContent> } | undefined | void;

export interface ToolResult {
    imports: Record<string, string[]>;
    activities: string[];
    action?: () => Promise<ToolActionResult>;
    // waitForNetwork: boolean;
    resultOverride?: { content: Array<ImageContent | TextContent> }
}

export interface Tool<Input extends InputSchema = InputSchema> {
    // capability: ToolCapability;
    //
    schema: ToolSchema<Input>;
    handler: (context: McpSessionContext, params: z.output<Input>) => Promise<ToolResult>;
}

export function defineTool<Input extends InputSchema>(definition: Tool<Input>): Tool<Input> {
    return definition;
}
