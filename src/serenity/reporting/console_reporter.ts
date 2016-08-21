import { DomainEvent } from '../domain/events';
import { Stage } from '../stage/stage';
import { StageCrewMember } from '../stage/stage_management';

import moment = require('moment');

export class ConsoleReporter implements StageCrewMember {
    private static Events_of_Interest = [ DomainEvent ];
    private stage: Stage;

    assignTo(stage: Stage) {
        this.stage = stage;

        this.stage.manager.registerInterestIn(ConsoleReporter.Events_of_Interest, this);
    }

    notifyOf(event: DomainEvent<any>): void {
        // tslint:disable-next-line:no-console
        console.log(
            `${ moment(event.timestamp).format('HH:mm:ss.SSS') } | ${ event.constructor.name }: ${ event.value }`
        );
    }
}
