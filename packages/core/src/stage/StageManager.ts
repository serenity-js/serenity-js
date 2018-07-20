import { match } from 'tiny-types';

import { AsyncOperationAttempted, DomainEvent } from '../domain';
import { AsyncOperationError } from '../errors';
import { Clock } from './Clock';
import { StageCrewMember } from './StageCrewMember';

export class StageManager {
    private readonly subscribers: StageCrewMember[] = [];
    private readonly wip: Array<Promise<void>> = [];

    constructor(private readonly clock = new Clock()) {
    }

    register(stageCrewMember: StageCrewMember) {
        this.subscribers.push(stageCrewMember);
    }

    notifyOf(event: DomainEvent): void {
        return match<DomainEvent, void>(event)
            .when(AsyncOperationAttempted, (evt: AsyncOperationAttempted) => {
                this.wip.push(evt.value.catch(error => Promise.reject(new AsyncOperationError(
                    `${ evt.crewMember.name } took ${ this.clock.now().diff(evt.timestamp) } to ${ evt.taskDescription } and has failed`,
                    error,
                ))));
            })
            .else(_ => this.subscribers.forEach(crewMember => crewMember.notifyOf(event)));
    }

    waitForNextCue() {
        return Promise.all(this.wip);
    }
}
