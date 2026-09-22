import type { AddressInfo } from 'node:net';

import type { DomainEvent } from '@serenity-js/core/events';
import * as events from '@serenity-js/core/events';
import type { JSONObject } from 'tiny-types';
import { WebSocketServer } from 'ws';

/**
 * A WebSocket server running in the Playwright Test reporter process,
 * receiving [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/)
 * streamed by [`WorkerEventStreamer`](https://serenity-js.org/api/playwright-test/class/WorkerEventStreamer/) instances
 * running in Playwright Test worker processes.
 *
 * Instantiated automatically when [`SerenityReporterForPlaywrightTestConfig.liveEvents`](https://serenity-js.org/api/playwright-test/interface/SerenityReporterForPlaywrightTestConfig/#liveEvents)
 * is enabled.
 */
export class LiveEventsServer {

    private server?: WebSocketServer;
    private readonly listeners: Array<(event: DomainEvent) => void> = [];

    start(): Promise<string> {
        return new Promise((resolve, reject) => {
            const server = new WebSocketServer({ host: '127.0.0.1', port: 0 });

            server.on('connection', socket => {
                socket.on('message', data => {
                    const event = this.deserialised(String(data));
                    if (event) {
                        this.listeners.forEach(listener => listener(event));
                    }
                });
            });

            server.once('listening', () => {
                this.server = server;
                const { port } = server.address() as AddressInfo;
                resolve(`ws://127.0.0.1:${ port }`);
            });

            server.once('error', (error: Error) => reject(error));
        });
    }

    onEvent(listener: (event: DomainEvent) => void): void {
        this.listeners.push(listener);
    }

    private deserialised(message: string): DomainEvent | undefined {
        try {
            const { type, value } = JSON.parse(message) as { type: string, value: JSONObject };
            const eventType = events[type];

            return typeof eventType?.fromJSON === 'function'
                ? eventType.fromJSON(value)
                : undefined;
        }
        catch {
            return undefined;
        }
    }

    async stop(): Promise<void> {
        if (! this.server) {
            return;
        }

        this.server.clients.forEach(client => client.terminate());

        await new Promise<void>((resolve, reject) => {
            this.server.close(error => error ? reject(error) : resolve());
        });

        this.server = undefined;
    }
}
