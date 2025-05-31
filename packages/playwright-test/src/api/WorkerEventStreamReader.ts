import fs from 'node:fs';

import type { DomainEvent } from '@serenity-js/core/lib/events';
import * as events from '@serenity-js/core/lib/events';
import type { JSONObject } from 'tiny-types';

export class WorkerEventStreamReader {

    hasStream(pathToEventStreamFile: string): boolean {
        return fs.existsSync(pathToEventStreamFile);
    }

    read<T extends DomainEvent>(
        pathToEventStreamFile: string,
        mapper: (input: { type: string, value: JSONObject }) => { type: string, value: JSONObject } = input => input
    ): T[] {
        const content = fs.readFileSync(pathToEventStreamFile, 'utf8');

        return content
            .split('\n')
            .filter(Boolean)
            .map(line => {
                const { type, value } = mapper(JSON.parse(line));
                return events[type].fromJSON(value);
            });
    }
}
