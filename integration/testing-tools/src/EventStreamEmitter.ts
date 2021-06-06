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
                } catch (error) {
                    throw new ConfigurationError(`Couldn't parse line ${ index + 1 }: ${line.trim()}`, error);
                }
            })
            .map((entry, index) => {
                try {
                    return events[ entry.type ].fromJSON(entry.event);
                } catch (error) {
                    throw new ConfigurationError(`Couldn't parse line ${ index + 1 }: ${JSON.stringify(entry)}`, error);
                }
            });

        entries.forEach(event => this.stage.announce(event));

        return this.stage.waitForNextCue();
    }
}
