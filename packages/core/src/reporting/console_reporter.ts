import { DomainEvent } from '../domain/events';
import { Stage, StageCrewMember } from '../stage';

import moment = require('moment');
import util = require('util');

export type MessagePrinter = (message: string) => void;

export function consoleReporter(print: MessagePrinter = console.log): StageCrewMember {
    return new ConsoleReporter(print);
}

export class ConsoleReporter implements StageCrewMember {
    private static Events_of_Interest = [ DomainEvent ];
    private stage: Stage;

    constructor(private print: MessagePrinter) {
    }

    assignTo(stage: Stage) {
        this.stage = stage;

        this.stage.manager.registerInterestIn(ConsoleReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        this.print(util.format('%s | %s: %s',
            moment(event.timestamp).format('HH:mm:ss.SSS'),
            event.constructor.name,
            event.value,
        ));
    }
}
