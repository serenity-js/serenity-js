import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import type {
    TextContent,
    Tool as McpTool
} from '@modelcontextprotocol/sdk/types.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';

import type { Config } from '../config/Config.js';
import { packageJSON } from '../package.js';
import tools from '../tools/index.js';
import type { BrowserConnection } from './BrowserConnection.js';
import { McpSessionContext } from './McpSessionContext.js';

function errorResult(...messages: string[]): { content: Array<TextContent>, isError: boolean } {
    return {
        content: [{ type: 'text', text: messages.join('\n') }],
        isError: true,
    };
}

export class McpServerConnection {
    static create(config: Config, browserConnection: BrowserConnection): McpServerConnection {
        const context = new McpSessionContext(tools, config, browserConnection);

        const server = new McpServer({
            name: packageJSON.name,
            version: packageJSON.version,
        }, {
            capabilities: { tools: {} }
        });

        server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: tools.map(tool => ({
                    name: tool.schema.name,
                    description: tool.schema.description,
                    inputSchema: zodToJsonSchema(tool.schema.inputSchema),
                    annotations: {
                        title: tool.schema.title,
                        readOnlyHint: tool.schema.type === 'readonly',
                        destructiveHint: tool.schema.type === 'destructive',
                        openWorldHint: true,
                    },
                })) as McpTool[],
            };
        })

        server.setRequestHandler(CallToolRequestSchema, async request => {

            const tool = tools.find(tool => tool.schema.name === request.params.name);
            if (! tool) {
                return errorResult(`Tool "${request.params.name}" not found`);
            }

            // const modalStates = context.modalStates().map(state => state.type);
            // if (tool.clearsModalState && !modalStates.includes(tool.clearsModalState))
            //     return errorResult(`The tool "${request.params.name}" can only be used when there is related modal state present.`, ...context.modalStatesMarkdown());
            // if (!tool.clearsModalState && modalStates.length)
            //     return errorResult(`Tool "${request.params.name}" does not handle the modal state.`, ...context.modalStatesMarkdown());

            try {
                return await context.run(tool, request.params.arguments);
            } catch (error) {
                return errorResult(String(error));
            }
        });

        return new McpServerConnection(server, context);
    }

    readonly server: McpServer;
    readonly context: McpSessionContext;

    constructor(server: McpServer, context: McpSessionContext) {
        this.server = server;
        this.context = context;
        this.server.oninitialized = () => {
            this.context.clientVersion = this.server.getClientVersion() as { name: string; version: string };
        };
    }

    async close(): Promise<void> {
        await this.server.close();
        await this.context.close();
    }
}
