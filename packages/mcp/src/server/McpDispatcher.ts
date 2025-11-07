import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { z } from 'zod';

import { packageJSON } from '../package.js';
import type { ScreenplayExecutionContext } from './context/index.js';
import type { ToolController } from './controllers/ToolController.js';
import type { InputSchema } from './schema.js';

export class McpDispatcher {
    private readonly server: McpServer;

    constructor(
        private readonly controllers: Array<ToolController<InputSchema>>,
        private readonly context: ScreenplayExecutionContext,
    ) {
        this.server = McpDispatcher.createMcpServer({
            name: packageJSON.name,
            version: packageJSON.version,
        });

        this.server.setRequestHandler(ListToolsRequestSchema, this.listTools.bind(this));
        this.server.setRequestHandler(CallToolRequestSchema, this.callTool.bind(this));

        // todo: review
        // this.server.oninitialized = () => {
        //     this.context.clientVersion = this.server.getClientVersion() as { name: string; version: string };
        // };
    }

    private static createMcpServer(options: { name: string; version: string }): McpServer {
        return new McpServer({
            ...options,
        }, {
            capabilities: { tools: {} }
        });
    }

    private listTools(): z.infer<typeof ListToolsResultSchema> {
        return {
            tools: this.controllers.map(controller => controller.toolDescriptor()),
        }
    }

    private async callTool(request: z.infer<typeof CallToolRequestSchema>): Promise<z.infer<typeof CallToolResultSchema>> {
        const controller = this.controllers.find(controller => controller.toolDescriptor().name === request.params.name);

        if (! controller) {
            return this.errorResult(`Tool "${request.params.name}" not found`);
        }

        // const modalStates = context.modalStates().map(state => state.type);
        // if (tool.clearsModalState && !modalStates.includes(tool.clearsModalState))
        //     return errorResult(`The tool "${request.params.name}" can only be used when there is related modal state present.`, ...context.modalStatesMarkdown());
        // if (!tool.clearsModalState && modalStates.length)
        //     return errorResult(`Tool "${request.params.name}" does not handle the modal state.`, ...context.modalStatesMarkdown());

        try {
            return await controller.execute(
                this.context,
                request.params.arguments
            );
        } catch (error) {
            return this.errorResult(String(error));
        }
    }

    async close(): Promise<void> {
        await this.server.close();
        await this.context.close();
    }

    private errorResult(...messages: string[]): z.infer<typeof CallToolResultSchema> {
        return {
            content: [{ type: 'text', text: messages.join('\n') }],
            isError: true,
        };
    }

    async connect(transport: Transport): Promise<void> {
        await this.server.connect(transport);
    }
}
