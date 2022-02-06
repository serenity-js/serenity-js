import { Stage, StageCrewMember } from '@serenity-js/core';
import * as events from '@serenity-js/core/lib/events';
import { Writable } from 'stream';

export class StdOutReporter implements StageCrewMember {

    public static linePrefix = '[Serenity/JS]';

    static parse(stdout: string): events.DomainEvent[] {
        return stdout.split('\n')
            .filter(line => !!~line.indexOf(StdOutReporter.linePrefix))
            .map(line => {
                const matched = line.match(/.*?\[Serenity\/JS](.*)$/);
                const serialised = JSON.parse(matched[1]);

                return events[serialised.type].fromJSON(serialised.event);
            });
    }

    constructor(
        private readonly output: Writable = process.stdout,
        private readonly stage?: Stage,
    ) {
    }

    assignedTo(stage: Stage): StageCrewMember {
        return new StdOutReporter(this.output, stage);
    }

    notifyOf(event: events.DomainEvent): void {
        this.output.write(`${ StdOutReporter.linePrefix }${ JSON.stringify({ type: event.constructor.name, event: event.toJSON() }) }\n`);
    }
}
