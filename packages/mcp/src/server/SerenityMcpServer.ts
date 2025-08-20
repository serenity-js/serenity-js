import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { ModuleLoader } from '@serenity-js/core/lib/io/index.js';

import type { ScreenplaySchematic } from './context/index.js';
import { ScreenplayExecutionContext } from './context/index.js';
import { ListCapabilitiesController, ScreenplayActivityController } from './controllers/index.js';
import type { PlaywrightBrowserConnection } from './integration/PlaywrightBrowserConnection.js';
import { McpDispatcher } from './McpDispatcher.js';

export class SerenityMcpServer {

    private readonly dispatchers: McpDispatcher[] = [];

    constructor(
        private readonly schematics: Array<ScreenplaySchematic>,
        private readonly moduleLoader: ModuleLoader,
        private readonly browserConnection: PlaywrightBrowserConnection,
    ) {
    }

    async connect(transport: Transport): Promise<McpDispatcher> {
        const dispatcher = this.createDispatcher();

        this.dispatchers.push(dispatcher);

        await dispatcher.server.connect(transport);

        return dispatcher;
    }

    private createDispatcher(): McpDispatcher {

        const context = new ScreenplayExecutionContext(
            this.browserConnection,
            this.moduleLoader,
        );

        const controllers = [
            ... this.schematics.map(schematic => new ScreenplayActivityController(schematic)),
            new ListCapabilitiesController(this.schematics)
        ];

        return new McpDispatcher(
            controllers,
            context,
        );
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
            await Promise.all(this.dispatchers.map(dispatcher => dispatcher.close()));

            process.exit(0);
        };
        /* eslint-enable unicorn/no-process-exit */

        process.stdin.on('close', handleExit);
        process.on('SIGINT', handleExit);
        process.on('SIGTERM', handleExit);
    }
}
