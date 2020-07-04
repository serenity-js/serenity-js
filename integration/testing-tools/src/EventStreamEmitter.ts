import { ConfigurationError, Stage } from '@serenity-js/core';
import * as events from '@serenity-js/core/lib/events';

export class EventStreamEmitter {
    constructor(private readonly stage: Stage) {
    }

    emit(eventLog: string): Promise<void> {
        const entries = eventLog
            .split('\n')
            .map(line => line.trim())
            .filter(line => !! line)
            .map((line, index) => {
                try {
                    return JSON.parse(line.trim());
                } catch (e) {
                    throw new ConfigurationError(`Couldn't parse line ${ index }: ${line.trim()}`, e);
                }
            })
            .map(entry => events[ entry.type ].fromJSON(entry.event));

        entries.forEach(event => this.stage.announce(event));

        return this.stage.waitForNextCue();
    }
}
