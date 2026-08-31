import type { Stage, StageCrewMember } from '@serenity-js/core';
import type { DomainEvent } from '@serenity-js/core/events';
import { WebSocket } from 'ws';

/**
 * Streams [Serenity/JS domain events](https://serenity-js.org/api/core-events/class/DomainEvent/) that occur in a Playwright Test worker process
 * to the [`LiveEventsServer`](https://serenity-js.org/api/playwright-test/class/LiveEventsServer/) running in the Playwright Test reporter process,
 * so that they can be announced to the reporter-side stage crew members as they happen,
 * rather than when the test is finished.
 *
 * Instantiated automatically when [`SerenityReporterForPlaywrightTestConfig.liveEvents`](https://serenity-js.org/api/playwright-test/interface/SerenityReporterForPlaywrightTestConfig/#liveEvents)
 * is enabled, and disabled otherwise.
 */
export class WorkerEventStreamer implements StageCrewMember {

    static readonly environmentVariableName = 'SERENITY_JS_LIVE_EVENTS_URL';

    private socket?: WebSocket;
    private readonly queue: string[] = [];

    static fromEnvironment(environment: Record<string, string | undefined> = process.env): WorkerEventStreamer {
        return new WorkerEventStreamer(environment[WorkerEventStreamer.environmentVariableName]);
    }

    constructor(
        serverUrl?: string,
        private stage?: Stage,
    ) {
        if (serverUrl) {
            this.socket = new WebSocket(serverUrl);
            this.socket.on('open', () => this.flushQueue());
            this.socket.on('error', () => {
                this.socket = undefined;
            });
        }
    }

    assignedTo(stage: Stage): StageCrewMember {
        this.stage = stage;

        return this;
    }

    notifyOf(event: DomainEvent): void {
        if (! this.socket) {
            return;
        }

        const message = JSON.stringify({ type: event.constructor.name, value: event.toJSON() });

        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(message);
        }
        else if (this.socket.readyState === WebSocket.CONNECTING) {
            this.queue.push(message);
        }
    }

    private flushQueue(): void {
        this.queue.splice(0).forEach(message => this.socket?.send(message));
    }

    async close(): Promise<void> {
        if (! this.socket || this.socket.readyState === WebSocket.CLOSED) {
            return;
        }

        await new Promise<void>(resolve => {
            this.socket.once('close', () => resolve());
            this.socket.close();
        });
    }
}
