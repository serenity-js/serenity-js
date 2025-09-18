import { Server as McpServer } from '@modelcontextprotocol/sdk/server/index.js';
import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { CallToolResult, ListToolsResult } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolRequest} from '@modelcontextprotocol/sdk/types.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { ZodSchema } from 'zod';

import { packageJSON } from '../../package.js';
import type { Context } from '../context/index.js';
import type { Tool, ToolConfig, ToolDependencies } from '../tool/index.js';

type ToolClass<IS extends ZodSchema, RS extends ZodSchema> =
    (new (dependencies: ToolDependencies, config: Partial<ToolConfig<IS, RS>>) => Tool<IS, RS>);

export class Dispatcher {
    private readonly server: McpServer;
    private readonly tools: Tool<ZodSchema, ZodSchema>[] = [];

    constructor(
        private readonly context: Context,
        tools: Array<ToolClass<ZodSchema, ZodSchema>>,
    ) {
        this.server = new McpServer({
            name: packageJSON.name,
            version: packageJSON.version,
        }, {
            capabilities: { tools: {} }
        });

        this.tools = tools.map(toolClass => new toolClass(
            { context: this.context },
            { namespace: 'serenity' },
        ));

        this.server.setRequestHandler(ListToolsRequestSchema, this.listTools.bind(this));
        this.server.setRequestHandler(CallToolRequestSchema, this.callTool.bind(this));
    }

    async connect(transport: Transport): Promise<void> {
        await this.server.connect(transport);
    }

    async close(): Promise<void> {
        await this.server.close();
        await this.context.close();
    }

    private listTools(): ListToolsResult {
        return {
            tools: this.tools.map(tool => tool.descriptor()),
        }
    }

    private async callTool(request: CallToolRequest): Promise<CallToolResult> {
        const tool = this.tools.find(tool => tool.matches(request.params.name));

        if (! tool) {
            // todo
            throw new Error('return error result and not throw; generic instruction - start with analyzing the project')
        }

        if (! this.context.isInitialised()) {
            await this.context.initialise();
        }

        try {
            return tool.callTool(request);
        }
        catch {
            // todo:
            throw new Error('return error result and not throw; generic instruction - start with analyzing the project')
        }
    }
}
