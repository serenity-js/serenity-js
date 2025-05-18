import * as fs from 'node:fs';

import * as events from '@serenity-js/core/lib/events';

export class WorkerEventStreamReader {

    hasStream(pathToEventStreamFile: string): boolean {
        return fs.existsSync(pathToEventStreamFile);
    }

    read(pathToEventStreamFile: string): events.DomainEvent[] {
        const content = fs.readFileSync(pathToEventStreamFile, 'utf8');

        return content
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const { type, value } = JSON.parse(line);
                return events[type].fromJSON(value);
            });
    }
}
