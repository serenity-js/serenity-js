import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

import type { Config } from '../config/Config.js';
import { BrowserConnection } from './BrowserConnection.js';
import { McpServerConnection } from './McpServerConnection.js';

export class SerenityMcpServer {

    private readonly connections: McpServerConnection[] = [];
    private readonly browserConnection: BrowserConnection;

    // todo: `config` might require the `FullConfig` trick to ensure all the fields are provided
    constructor(private readonly config: Config) {
        this.browserConnection = new BrowserConnection(config.browser);
    }

    async connect(transport: Transport): Promise<McpServerConnection> {
        const connection = McpServerConnection.create(this.config, this.browserConnection);
        this.connections.push(connection);
        await connection.server.connect(transport);

        return connection;
    }

    registerProcessExitHandler(): void {
        /* eslint-disable unicorn/no-process-exit */
        let isExiting = false;
        const handleExit = async () => {
            if (isExiting) {
                return;
            }

            isExiting = true;
            setTimeout(() => process.exit(0), 15_000);
            await Promise.all(this.connections.map(connection => connection.close()));

            process.exit(0);
        };
        /* eslint-enable unicorn/no-process-exit */

        process.stdin.on('close', handleExit);
        process.on('SIGINT', handleExit);
        process.on('SIGTERM', handleExit);
    }
}
