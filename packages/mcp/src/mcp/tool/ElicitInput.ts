import type { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import type { ElicitRequestSchema, ElicitResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

export class ElicitInput {
    constructor(private readonly server: McpServer) {
    }

    async request<T extends z.Schema>(message: string, schema: T): Promise<z.infer<T>> {
        const response: z.infer<typeof ElicitResultSchema> = await this.server.elicitInput({
            message,
            requestedSchema: zodToJsonSchema(schema, { strictUnions: true }) as z.infer<typeof ElicitRequestSchema>['params']['requestedSchema']
        });

        // Parse the response using the provided schema to ensure type safety
        return schema.parse(response.content);
    }

    async confirm(message: string): Promise<boolean> {
        if (! this.clientSupports('elicitation')) {
            return true;
        }

        const response: z.infer<typeof ElicitResultSchema> = await this.server.elicitInput({
            message,
            requestedSchema: zodToJsonSchema(z.object({}), { strictUnions: true }) as z.infer<typeof ElicitRequestSchema>['params']['requestedSchema']
        });

        return response.action === 'accept';
    }

    private clientSupports(capabilityName: string): boolean {
        return Boolean(this.server.getClientCapabilities()[capabilityName]);
    }
}
