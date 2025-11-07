import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';

import type { Dispatcher } from './Dispatcher.js';

export class Server {

    private isExiting: boolean = false;

    constructor(private readonly dispatcher: Dispatcher) {
    }

    async connect(transport: Transport): Promise<void> {
        await this.dispatcher.connect(transport);
    }

    shutdown(exitFunction: () => void): () => Promise<void> {
        return async () => {
            if (this.isExiting) {
                return;
            }

            this.isExiting = true;
            const timeoutId = setTimeout(exitFunction, 15_000);

            await this.dispatcher.close();

            clearTimeout(timeoutId);

            exitFunction();
        }
    }
}
